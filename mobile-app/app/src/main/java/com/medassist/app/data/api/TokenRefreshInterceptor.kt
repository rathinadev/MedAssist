package com.medassist.app.data.api

import com.google.gson.Gson
import com.medassist.app.data.model.RefreshTokenRequest
import com.medassist.app.data.model.RefreshTokenResponse
import com.medassist.app.util.TokenManager
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.Response
import javax.inject.Inject

class TokenRefreshInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    private val gson = Gson()

    override fun intercept(chain: Interceptor.Chain): Response {
        val response = chain.proceed(chain.request())

        // If we get a 401, try to refresh the token
        if (response.code == 401) {
            val refreshToken = tokenManager.getRefreshToken() ?: return response

            // Close the previous response
            response.close()

            // Try to refresh the token
            val newAccessToken = refreshAccessToken(refreshToken, chain)

            if (newAccessToken != null) {
                // Retry the original request with the new token
                val newRequest = chain.request().newBuilder()
                    .header("Authorization", "Bearer $newAccessToken")
                    .build()
                return chain.proceed(newRequest)
            } else {
                // Refresh failed, clear tokens
                tokenManager.clearAll()
            }
        }

        return response
    }

    private fun refreshAccessToken(refreshToken: String, chain: Interceptor.Chain): String? {
        return try {
            val refreshRequest = RefreshTokenRequest(refresh = refreshToken)
            val jsonBody = gson.toJson(refreshRequest)
            val requestBody = jsonBody.toRequestBody("application/json".toMediaType())

            val baseUrl = chain.request().url.scheme + "://" + chain.request().url.host +
                    (if (chain.request().url.port != 80 && chain.request().url.port != 443)
                        ":${chain.request().url.port}" else "")

            val request = Request.Builder()
                .url("$baseUrl/api/auth/refresh/")
                .post(requestBody)
                .build()

            val refreshResponse = chain.proceed(request)

            if (refreshResponse.isSuccessful) {
                val body = refreshResponse.body?.string()
                val tokenResponse = gson.fromJson(body, RefreshTokenResponse::class.java)
                tokenManager.saveTokens(tokenResponse.access, refreshToken)
                refreshResponse.close()
                tokenResponse.access
            } else {
                refreshResponse.close()
                null
            }
        } catch (e: Exception) {
            null
        }
    }
}
