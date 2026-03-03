#!/bin/bash

BASE_URL="http://localhost:8000/api"
TOKEN=""
PATIENT_USER_ID=""
PATIENT_PROFILE_ID=""
MEDICATION_ID=""

echo "=========================================="
echo "BACKEND API COMPREHENSIVE TEST SUITE"
echo "=========================================="
echo ""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

test_count=0
pass_count=0
fail_count=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local needs_auth=$5
    local description=$6
    
    test_count=$((test_count + 1))
    
    local auth_header=""
    if [ "$needs_auth" = "true" ] && [ -n "$TOKEN" ]; then
        auth_header="Authorization: Bearer $TOKEN"
    fi
    
    local http_code
    local body
    
    if [ -n "$data" ]; then
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "$auth_header" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint" 2>&1)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "Content-Type: application/json" \
                -d "$data" \
                "$BASE_URL$endpoint" 2>&1)
        fi
    else
        if [ -n "$auth_header" ]; then
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                -H "$auth_header" \
                "$BASE_URL$endpoint" 2>&1)
        else
            response=$(curl -s -w "\n%{http_code}" -X "$method" \
                "$BASE_URL$endpoint" 2>&1)
        fi
    fi
    
    http_code=$(echo "$response" | tail -n1 | tr -d '\r')
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_status" ]; then
        echo -e "${GREEN}✓${NC} Test $test_count: $description (HTTP $http_code)"
        pass_count=$((pass_count + 1))
        return 0
    else
        echo -e "${RED}✗${NC} Test $test_count: $description (Expected HTTP $expected_status, got $http_code)"
        echo "  Response: $body"
        fail_count=$((fail_count + 1))
        return 1
    fi
}

echo "1. AUTHENTICATION TESTS"
echo "======================"

# Register caretaker
echo "  → Registering caretaker..."
caretaker_response=$(curl -s -X POST "$BASE_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"email": "caretaker@test.com", "password": "testpass123", "password_confirm": "testpass123", "name": "Test Caretaker", "phone": "+1234567890", "role": "caretaker"}')
CARETAKER_ID=$(echo $caretaker_response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Caretaker ID: $CARETAKER_ID"

# Register patient
echo "  → Registering patient..."
patient_reg_response=$(curl -s -X POST "$BASE_URL/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"email": "patient@test.com", "password": "testpass123", "password_confirm": "testpass123", "name": "Test Patient", "phone": "+9876543210", "role": "patient"}')
PATIENT_USER_ID=$(echo $patient_reg_response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Patient User ID: $PATIENT_USER_ID"

# Login
echo "  → Logging in..."
login_response=$(curl -s -X POST "$BASE_URL/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"email": "caretaker@test.com", "password": "testpass123"}')
TOKEN=$(echo $login_response | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
echo "  ✓ Token obtained"

test_endpoint "GET" "/auth/me/" "" "200" "true" "Get user profile"

REFRESH_TOKEN=$(echo $login_response | grep -o '"refresh":"[^"]*"' | cut -d'"' -f4)
test_endpoint "POST" "/auth/refresh/" "{\"refresh\": \"$REFRESH_TOKEN\"}" "200" "false" "Refresh token"

echo ""
echo "2. PATIENT MANAGEMENT"
echo "====================="

# Create patient profile with user_id
echo "  → Creating patient profile..."
profile_response=$(curl -s -X POST "$BASE_URL/patients/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"user_id\": $PATIENT_USER_ID, \"age\": 65, \"medical_conditions\": \"Diabetes, Hypertension\"}")
PATIENT_PROFILE_ID=$(echo $profile_response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Patient Profile ID: $PATIENT_PROFILE_ID"

test_endpoint "GET" "/patients/" "" "200" "true" "List patients"
test_endpoint "GET" "/patients/$PATIENT_PROFILE_ID/" "" "200" "true" "Get patient details"

echo ""
echo "3. MEDICATION MANAGEMENT"
echo "========================"

# Create medication with patient_id
echo "  → Creating medication..."
med_response=$(curl -s -X POST "$BASE_URL/medications/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"name\": \"Metformin\", \"dosage\": \"500mg\", \"frequency\": \"twice_daily\", \"timings\": [\"08:00\", \"20:00\"], \"instructions\": \"Take after meals\", \"patient_id\": $PATIENT_USER_ID}")
MEDICATION_ID=$(echo $med_response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Medication ID: $MEDICATION_ID"

test_endpoint "GET" "/medications/?patient_id=$PATIENT_USER_ID" "" "200" "true" "List medications"

if [ -n "$MEDICATION_ID" ]; then
    test_endpoint "PUT" "/medications/$MEDICATION_ID/" "{\"name\": \"Metformin XR\", \"dosage\": \"1000mg\", \"frequency\": \"once_daily\", \"timings\": [\"08:00\"], \"instructions\": \"Take with breakfast\", \"patient_id\": $PATIENT_USER_ID}" "200" "true" "Update medication"
fi

echo ""
echo "4. ADHERENCE"
echo "============"

# Schedule requires patient_id for caretakers
test_endpoint "GET" "/schedule/today/?patient_id=$PATIENT_USER_ID" "" "200" "true" "Get today's schedule"
test_endpoint "GET" "/adherence/stats/?patient_id=$PATIENT_USER_ID" "" "200" "true" "Get adherence stats"
test_endpoint "GET" "/adherence/history/?patient_id=$PATIENT_USER_ID&from=2026-03-01&to=2026-03-31" "" "200" "true" "Get adherence history"

# Log adherence
if [ -n "$MEDICATION_ID" ]; then
    echo "  → Logging adherence..."
    log_response=$(curl -s -X POST "$BASE_URL/adherence/log/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"medication\": $MEDICATION_ID, \"status\": \"taken\", \"taken_time\": \"2026-03-03T08:15:00Z\"}")
    echo "  Response: $log_response"
fi

echo ""
echo "5. PRESCRIPTIONS"
echo "================"

test_endpoint "GET" "/prescriptions/?patient_id=$PATIENT_USER_ID" "" "200" "true" "List prescriptions"

echo ""
echo "6. PREDICTIONS"
echo "=============="

test_endpoint "GET" "/predictions/$PATIENT_USER_ID/" "" "200" "true" "Get ML predictions"

echo "  → Generating predictions..."
pred_response=$(curl -s -X POST "$BASE_URL/predictions/generate/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"patient_id\": $PATIENT_USER_ID}")
echo "  Response: $pred_response"

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✓ All backend API tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠ Some tests failed${NC}"
    exit 1
fi
