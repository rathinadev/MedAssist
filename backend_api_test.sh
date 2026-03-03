#!/bin/bash

BASE_URL="http://localhost:8000/api"
TOKEN=""
PATIENT_ID=""
MEDICATION_ID=""
ADHERENCE_LOG_ID=""

echo "=========================================="
echo "BACKEND API COMPREHENSIVE TEST SUITE"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

test_count=0
pass_count=0
fail_count=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local data=$3
    local expected_status=$4
    local auth=$5
    local description=$6
    
    test_count=$((test_count + 1))
    
    local headers="-H 'Content-Type: application/json'"
    if [ "$auth" = "true" ] && [ -n "$TOKEN" ]; then
        headers="$headers -H 'Authorization: Bearer $TOKEN'"
    fi
    
    local response
    if [ -n "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X $method $headers -d "$data" "$BASE_URL$endpoint" 2>&1)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method $headers "$BASE_URL$endpoint" 2>&1)
    fi
    
    local http_code=$(echo "$response" | tail -n1)
    local body=$(echo "$response" | sed '$d')
    
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

# Test 1: Register caretaker
echo "  → Registering new caretaker..."
response=$(curl -s -X POST "http://localhost:8000/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"email": "caretaker@test.com", "password": "testpass123", "name": "Test Caretaker", "phone": "+1234567890", "role": "caretaker"}' 2>&1)
echo "  Response: $response"

# Test 2: Register patient
echo "  → Registering new patient..."
patient_response=$(curl -s -X POST "http://localhost:8000/api/auth/register/" \
  -H "Content-Type: application/json" \
  -d '{"email": "patient@test.com", "password": "testpass123", "name": "Test Patient", "phone": "+9876543210", "role": "patient"}' 2>&1)
echo "  Response: $patient_response"

# Test 3: Login with caretaker
echo "  → Logging in as caretaker..."
login_response=$(curl -s -X POST "http://localhost:8000/api/auth/login/" \
  -H "Content-Type: application/json" \
  -d '{"email": "caretaker@test.com", "password": "testpass123"}' 2>&1)
echo "  Response: $login_response"
TOKEN=$(echo $login_response | grep -o '"access":"[^"]*"' | cut -d'"' -f4)
echo "  Token extracted: ${TOKEN:0:50}..."

# Test 4: Get profile
test_endpoint "GET" "/auth/me/" "" "200" "true" "Get current user profile"

echo ""
echo "2. PATIENT MANAGEMENT TESTS"
echo "=========================="

# Test 5: Create patient profile
echo "  → Creating patient profile..."
patient_data='{"user_email": "patient@test.com", "age": 65, "medical_conditions": "Diabetes, Hypertension"}'
patient_response=$(curl -s -X POST "http://localhost:8000/api/patients/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "$patient_data" 2>&1)
echo "  Response: $patient_response"
PATIENT_ID=$(echo $patient_response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "  Patient ID: $PATIENT_ID"

# Test 6: List patients
test_endpoint "GET" "/patients/" "" "200" "true" "List all patients"

# Test 7: Get patient details
if [ -n "$PATIENT_ID" ]; then
    test_endpoint "GET" "/patients/$PATIENT_ID/" "" "200" "true" "Get patient details"
fi

echo ""
echo "3. MEDICATION MANAGEMENT TESTS"
echo "=============================="

# Test 8: Create medication
if [ -n "$PATIENT_ID" ]; then
    echo "  → Creating medication..."
    med_data="{\"name\": \"Metformin\", \"dosage\": \"500mg\", \"frequency\": \"twice_daily\", \"timings\": [\"08:00\", \"20:00\"], \"instructions\": \"Take after meals\", \"patient\": $PATIENT_ID}"
    med_response=$(curl -s -X POST "http://localhost:8000/api/medications/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$med_data" 2>&1)
    echo "  Response: $med_response"
    MEDICATION_ID=$(echo $med_response | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
    echo "  Medication ID: $MEDICATION_ID"
fi

# Test 9: List medications
if [ -n "$PATIENT_ID" ]; then
    test_endpoint "GET" "/medications/?patient_id=$PATIENT_ID" "" "200" "true" "List medications for patient"
fi

echo ""
echo "4. ADHERENCE TESTS"
echo "=================="

# Test 10: Get today's schedule
test_endpoint "GET" "/schedule/today/" "" "200" "true" "Get today's schedule"

# Test 11: Get adherence stats
if [ -n "$PATIENT_ID" ]; then
    test_endpoint "GET" "/adherence/stats/?patient_id=$PATIENT_ID" "" "200" "true" "Get adherence stats"
fi

# Test 12: Get adherence history
if [ -n "$PATIENT_ID" ]; then
    test_endpoint "GET" "/adherence/history/?patient_id=$PATIENT_ID&from=2026-03-01&to=2026-03-31" "" "200" "true" "Get adherence history"
fi

echo ""
echo "5. PRESCRIPTION TESTS"
echo "====================="

# Test 13: List prescriptions
if [ -n "$PATIENT_ID" ]; then
    test_endpoint "GET" "/prescriptions/?patient_id=$PATIENT_ID" "" "200" "true" "List prescriptions"
fi

echo ""
echo "6. PREDICTION TESTS"
echo "==================="

# Test 14: Get predictions
if [ -n "$PATIENT_ID" ]; then
    test_endpoint "GET" "/predictions/$PATIENT_ID/" "" "200" "true" "Get ML predictions"
fi

# Test 15: Generate predictions
echo "  → Testing prediction generation..."
if [ -n "$PATIENT_ID" ]; then
    pred_response=$(curl -s -X POST "http://localhost:8000/api/predictions/generate/" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "{\"patient_id\": $PATIENT_ID}" 2>&1)
    echo "  Response: $pred_response"
fi

echo ""
echo "=========================================="
echo "TEST SUMMARY"
echo "=========================================="
echo -e "Total Tests: $test_count"
echo -e "${GREEN}Passed: $pass_count${NC}"
echo -e "${RED}Failed: $fail_count${NC}"
echo ""

if [ $fail_count -eq 0 ]; then
    echo -e "${GREEN}✓ All backend API tests passed!${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed${NC}"
    exit 1
fi
