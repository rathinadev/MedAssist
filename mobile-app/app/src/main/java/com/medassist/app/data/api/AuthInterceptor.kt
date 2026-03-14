package com.medassist.app.data.api

import com.medassist.app.util.TokenManager
import okhttp3.Interceptor
import okhttp3.Response
import javax.inject.Inject

class AuthInterceptor @Inject constructor(
    private val tokenManager: TokenManager
) : Interceptor {

    companion object {
        private val NO_AUTH_ENDPOINTS = listOf(
            "/auth/login/",
            "/auth/register/",
            "/auth/refresh/"
        )
    }

    override fun intercept(chain: Interceptor.Chain): Response {
        val originalRequest = chain.request()

        // Skip auth for login/register/refresh endpoints
        val isNoAuthEndpoint = NO_AUTH_ENDPOINTS.any { endpoint ->
            originalRequest.url.encodedPath.contains(endpoint)
        }

        if (isNoAuthEndpoint) {
            return chain.proceed(originalRequest)
        }

        val accessToken = tokenManager.getAccessToken()

        val request = if (accessToken != null) {
            originalRequest.newBuilder()
                .header("Authorization", "Bearer $accessToken")
                .build()
        } else {
            originalRequest
        }

        return chain.proceed(request)
    }
}
