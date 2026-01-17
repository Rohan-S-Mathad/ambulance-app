package com.example.ambulance.data

import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Retrofit Client for Twilio Serverless Emergency API
 * No local server needed - calls Twilio's hosted function directly!
 */
object RetrofitClient {

    // PHYSICAL DEVICE MODE: Using computer's IP address
    // Your computer's current IP: 172.17.6.158 (Updated)
    // Previous IP: 10.251.87.24 (Old - WiFi might have changed)
    // Make sure phone and computer are on the SAME WiFi network!
    private const val BASE_URL = "http://172.17.6.158:3000/"

    // For Android Emulator: Use this instead
    // private const val BASE_URL = "http://10.0.2.2:3000/"

    // SERVERLESS MODE: Twilio Function URL (deployed to Twilio)
    // private const val BASE_URL = "https://YOUR-SERVICE-NAME-XXXX.twil.io/"

    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(GsonConverterFactory.create())
        .build()

    val twilioApi: TwilioApiService = retrofit.create(TwilioApiService::class.java)
}
