package com.medassist.app.data.model

import com.google.gson.annotations.SerializedName

// --- Request Models ---

data class LoginRequest(
    val email: String,
    val password: String
)

data class RegisterRequest(
    val email: String,
    val password: String,
    val name: String,
    val phone: String,
    val role: String
)

data class RefreshTokenRequest(
    val refresh: String
)

// --- Response Models ---

data class LoginResponse(
    val user: User,
    val tokens: Tokens
)

data class RegisterResponse(
    val id: Int,
    val email: String,
    val name: String,
    val role: String,
    val tokens: Tokens
)

data class RefreshTokenResponse(
    val access: String
)

data class User(
    val id: Int,
    val email: String,
    val name: String,
    val phone: String? = null,
    val role: String
)

data class Tokens(
    val access: String,
    val refresh: String
)
