package com.medassist.app.data.repository

import com.medassist.app.data.api.ApiService
import com.medassist.app.data.model.*
import com.medassist.app.util.TokenManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AuthRepository @Inject constructor(
    private val apiService: ApiService,
    private val tokenManager: TokenManager
) {

    suspend fun login(email: String, password: String): Result<LoginResponse> =
        withContext(Dispatchers.IO) {
            try {
                val response = apiService.login(LoginRequest(email, password))
                if (response.isSuccessful) {
                    val body = response.body()!!
                    tokenManager.saveTokens(body.tokens.access, body.tokens.refresh)
                    tokenManager.saveUserInfo(
                        id = body.user.id,
                        name = body.user.name,
                        email = body.user.email,
                        role = body.user.role
                    )
                    Result.success(body)
                } else {
                    Result.failure(Exception("Login failed: ${response.code()} ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun register(
        email: String,
        password: String,
        name: String,
        phone: String,
        role: String
    ): Result<RegisterResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.register(
                RegisterRequest(email, password, name, phone, role)
            )
            if (response.isSuccessful) {
                val body = response.body()!!
                tokenManager.saveTokens(body.tokens.access, body.tokens.refresh)
                tokenManager.saveUserInfo(
                    id = body.id,
                    name = body.name,
                    email = body.email,
                    role = body.role
                )
                Result.success(body)
            } else {
                Result.failure(Exception("Registration failed: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getMe(): Result<User> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getMe()
            if (response.isSuccessful) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to get user info: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    fun isLoggedIn(): Boolean = tokenManager.isLoggedIn()

    fun getUserRole(): String? = tokenManager.getUserRole()

    fun getUserName(): String? = tokenManager.getUserName()

    fun getUserId(): Int = tokenManager.getUserId()

    fun logout() {
        tokenManager.clearAll()
    }
}
