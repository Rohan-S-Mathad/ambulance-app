package com.example.ambulance.ui.hospital

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Matrix
import android.graphics.Paint
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import com.example.ambulance.R
import com.example.ambulance.databinding.ActivityHospitalPatientLocationBinding
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.max
import kotlin.math.min
import kotlin.random.Random

/**
 * HospitalPatientLocationActivity - Interactive Map with Zoom/Pan
 *
 * Features:
 * - Custom map background image
 * - Pinch to zoom
 * - Pan/drag to move
 * - Zoom in/out buttons
 * - Patient marker that updates position
 * - Live coordinates every 2 seconds
 */
class HospitalPatientLocationActivity : AppCompatActivity() {

    private lateinit var binding: ActivityHospitalPatientLocationBinding

    // RV College of Engineering coordinates
    private var basePatientLat: Double = 12.9236
    private var basePatientLon: Double = 77.4985

    // Current simulated location
    private var currentPatientLat: Double = 0.0
    private var currentPatientLon: Double = 0.0

    private var incidentId: String = ""

    // Update handler
    private val updateHandler = Handler(Looper.getMainLooper())
    private val updateInterval = 2000L // 2 seconds

    // Movement parameters
    private val maxMovementMeters = 10.0
    private val degreesPerMeter = 0.00001

    // Zoom and pan variables
    private val matrix = Matrix()
    private val savedMatrix = Matrix()
    private var scale = 1f
    private val maxScale = 5f
    private val minScale = 0.5f
    private var mode = NONE

    // Touch event tracking
    private val start = android.graphics.PointF()
    private val mid = android.graphics.PointF()
    private var oldDist = 1f

    // Scale gesture detector for pinch zoom
    private lateinit var scaleGestureDetector: ScaleGestureDetector

    companion object {
        private const val NONE = 0
        private const val DRAG = 1
        private const val ZOOM = 2
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityHospitalPatientLocationBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Set up toolbar
        setSupportActionBar(binding.toolbar)
        supportActionBar?.setDisplayHomeAsUpEnabled(true)
        supportActionBar?.setDisplayShowHomeEnabled(true)
        supportActionBar?.title = "Interactive Map"

        // Get data from intent
        basePatientLat = intent.getDoubleExtra("patientLat", 12.9236)
        basePatientLon = intent.getDoubleExtra("patientLon", 77.4985)
        incidentId = intent.getStringExtra("incidentId") ?: "DEMO-001"

        // Initialize current position
        currentPatientLat = basePatientLat
        currentPatientLon = basePatientLon

        // Setup map
        setupMap()
        setupUI()

        // Start simulation
        startLocationSimulation()

        Toast.makeText(this, "🗺️ Pinch to zoom, drag to pan!", Toast.LENGTH_LONG).show()
    }

    private fun setupMap() {
        // Try to load the real RV College satellite map image
        try {
            // Try to get the drawable resource ID for rv_college_map
            val resId = resources.getIdentifier("rv_college_map", "drawable", packageName)

            if (resId != 0) {
                // Image exists, load it
                val drawable = ContextCompat.getDrawable(this, resId)
                binding.imageViewMap.setImageDrawable(drawable)
                Toast.makeText(this, "🗺️ Real satellite map loaded!", Toast.LENGTH_SHORT).show()
            } else {
                // Image not found, use generated map
                val mapBitmap = createMapBackground()
                binding.imageViewMap.setImageBitmap(mapBitmap)
                Toast.makeText(
                    this,
                    "🎨 Generated map (add rv_college_map.jpg to drawable folder)",
                    Toast.LENGTH_LONG
                ).show()
            }
        } catch (e: Exception) {
            // If any error, use generated map as fallback
            val mapBitmap = createMapBackground()
            binding.imageViewMap.setImageBitmap(mapBitmap)
            Toast.makeText(
                this,
                "🎨 Using generated map",
                Toast.LENGTH_SHORT
            ).show()
        }

        // Initialize zoom matrix
        binding.imageViewMap.imageMatrix = matrix

        // Setup scale gesture detector for pinch zoom
        scaleGestureDetector = ScaleGestureDetector(this, ScaleListener())

        // Setup touch listener for pan and zoom
        binding.imageViewMap.setOnTouchListener { view, event ->
            scaleGestureDetector.onTouchEvent(event)
            handleTouch(event)
            true
        }
    }

    private fun createMapBackground(): Bitmap {
        // Create a bitmap with map-like appearance
        val width = 1080
        val height = 1920
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Background color (dark map style)
        canvas.drawColor(Color.parseColor("#2D3142"))

        val paint = Paint()
        paint.isAntiAlias = true

        // Draw roads/streets (lighter lines)
        paint.color = Color.parseColor("#4F5D75")
        paint.strokeWidth = 8f

        // Horizontal roads
        for (i in 0..10) {
            val y = (height * i / 10).toFloat()
            canvas.drawLine(0f, y, width.toFloat(), y, paint)
        }

        // Vertical roads
        for (i in 0..10) {
            val x = (width * i / 10).toFloat()
            canvas.drawLine(x, 0f, x, height.toFloat(), paint)
        }

        // Draw some green areas (parks/vegetation)
        paint.color = Color.parseColor("#3A5A40")
        paint.style = Paint.Style.FILL

        canvas.drawRect(100f, 200f, 400f, 500f, paint)
        canvas.drawRect(600f, 800f, 900f, 1200f, paint)
        canvas.drawRect(200f, 1400f, 600f, 1700f, paint)

        // Draw center marker area (RV College area)
        paint.color = Color.parseColor("#EF476F")
        canvas.drawCircle((width / 2).toFloat(), (height / 2).toFloat(), 80f, paint)

        return bitmap
    }

    private fun handleTouch(event: MotionEvent): Boolean {
        when (event.action and MotionEvent.ACTION_MASK) {
            MotionEvent.ACTION_DOWN -> {
                savedMatrix.set(matrix)
                start.set(event.x, event.y)
                mode = DRAG
            }

            MotionEvent.ACTION_POINTER_DOWN -> {
                oldDist = spacing(event)
                if (oldDist > 10f) {
                    savedMatrix.set(matrix)
                    midPoint(mid, event)
                    mode = ZOOM
                }
            }

            MotionEvent.ACTION_UP, MotionEvent.ACTION_POINTER_UP -> {
                mode = NONE
            }

            MotionEvent.ACTION_MOVE -> {
                if (mode == DRAG) {
                    matrix.set(savedMatrix)
                    val dx = event.x - start.x
                    val dy = event.y - start.y
                    matrix.postTranslate(dx, dy)
                } else if (mode == ZOOM) {
                    val newDist = spacing(event)
                    if (newDist > 10f) {
                        matrix.set(savedMatrix)
                        val scale = newDist / oldDist
                        matrix.postScale(scale, scale, mid.x, mid.y)
                    }
                }
            }
        }

        binding.imageViewMap.imageMatrix = matrix
        updatePatientMarkerPosition()
        return true
    }

    private fun spacing(event: MotionEvent): Float {
        val x = event.getX(0) - event.getX(1)
        val y = event.getY(0) - event.getY(1)
        return kotlin.math.sqrt((x * x + y * y).toDouble()).toFloat()
    }

    private fun midPoint(point: android.graphics.PointF, event: MotionEvent) {
        val x = event.getX(0) + event.getX(1)
        val y = event.getY(0) + event.getY(1)
        point.set(x / 2, y / 2)
    }

    inner class ScaleListener : ScaleGestureDetector.SimpleOnScaleGestureListener() {
        override fun onScale(detector: ScaleGestureDetector): Boolean {
            scale *= detector.scaleFactor
            scale = max(minScale, min(scale, maxScale))

            matrix.setScale(scale, scale)
            binding.imageViewMap.imageMatrix = matrix
            updatePatientMarkerPosition()
            return true
        }
    }

    private fun updatePatientMarkerPosition() {
        // Calculate screen position for patient marker
        val screenWidth = binding.imageViewMap.width
        val screenHeight = binding.imageViewMap.height

        // Center the marker on screen
        val x = screenWidth / 2f - binding.imageViewPatientMarker.width / 2f
        val y = screenHeight / 2f - binding.imageViewPatientMarker.height / 2f

        binding.imageViewPatientMarker.x = x
        binding.imageViewPatientMarker.y = y
    }

    private fun setupUI() {
        binding.textViewIncidentIdMap.text = "Incident: $incidentId"
        updateLocationDisplay()

        // Zoom in button
        binding.buttonZoomIn.setOnClickListener {
            scale = min(scale * 1.2f, maxScale)
            matrix.setScale(scale, scale)
            binding.imageViewMap.imageMatrix = matrix
            updatePatientMarkerPosition()
            Toast.makeText(this, "Zoom: ${(scale * 100).toInt()}%", Toast.LENGTH_SHORT).show()
        }

        // Zoom out button
        binding.buttonZoomOut.setOnClickListener {
            scale = max(scale / 1.2f, minScale)
            matrix.setScale(scale, scale)
            binding.imageViewMap.imageMatrix = matrix
            updatePatientMarkerPosition()
            Toast.makeText(this, "Zoom: ${(scale * 100).toInt()}%", Toast.LENGTH_SHORT).show()
        }

        // Center button
        binding.buttonCenterMapHospital.setOnClickListener {
            scale = 1f
            matrix.reset()
            matrix.setScale(scale, scale)
            binding.imageViewMap.imageMatrix = matrix
            updatePatientMarkerPosition()
            Toast.makeText(this, "Map centered", Toast.LENGTH_SHORT).show()
        }

        // Refresh button
        binding.buttonRefreshLocationHospital.setOnClickListener {
            simulatePatientMovement()
            Toast.makeText(this, "Location refreshed!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun startLocationSimulation() {
        updateHandler.post(object : Runnable {
            override fun run() {
                simulatePatientMovement()
                updateLocationDisplay()
                updateTimestamp()

                updateHandler.postDelayed(this, updateInterval)
            }
        })
    }

    private fun simulatePatientMovement() {
        val randomLatOffset =
            Random.nextDouble(-maxMovementMeters, maxMovementMeters) * degreesPerMeter
        val randomLonOffset =
            Random.nextDouble(-maxMovementMeters, maxMovementMeters) * degreesPerMeter

        currentPatientLat = basePatientLat + randomLatOffset
        currentPatientLon = basePatientLon + randomLonOffset
    }

    private fun updateLocationDisplay() {
        binding.textViewPatientLocationMap.text = String.format(
            "Lat: %.6f\nLon: %.6f\n📍 RV College",
            currentPatientLat,
            currentPatientLon
        )
    }

    private fun updateTimestamp() {
        val timeFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
        binding.textViewLastUpdateHospital.text = "Updated: ${timeFormat.format(Date())}"
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }

    override fun onBackPressed() {
        finish()
    }

    override fun onDestroy() {
        super.onDestroy()
        updateHandler.removeCallbacksAndMessages(null)
    }
}
