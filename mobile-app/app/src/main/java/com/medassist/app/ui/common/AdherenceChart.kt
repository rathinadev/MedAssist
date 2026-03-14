package com.medassist.app.ui.common

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.medassist.app.ui.theme.Error
import com.medassist.app.ui.theme.Success
import com.medassist.app.ui.theme.Warning

@Composable
fun AdherenceRingChart(
    adherenceRate: Double,
    modifier: Modifier = Modifier,
    size: Int = 120
) {
    val rateColor = when {
        adherenceRate >= 80 -> Success
        adherenceRate >= 50 -> Warning
        else -> Error
    }

    Box(
        modifier = modifier.size(size.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val strokeWidth = 12.dp.toPx()
            val arcSize = Size(
                this.size.width - strokeWidth,
                this.size.height - strokeWidth
            )
            val topLeft = Offset(strokeWidth / 2, strokeWidth / 2)

            // Background circle
            drawArc(
                color = Color.LightGray.copy(alpha = 0.3f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )

            // Progress arc
            drawArc(
                color = rateColor,
                startAngle = -90f,
                sweepAngle = (adherenceRate / 100.0 * 360).toFloat(),
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "${adherenceRate.toInt()}%",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = rateColor
            )
            Text(
                text = "Adherence",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
fun AdherenceBarChart(
    taken: Int,
    missed: Int,
    late: Int,
    modifier: Modifier = Modifier
) {
    val total = (taken + missed + late).coerceAtLeast(1)

    Column(modifier = modifier.fillMaxWidth()) {
        Text(
            text = "Adherence Breakdown",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.SemiBold
        )

        Spacer(modifier = Modifier.height(12.dp))

        AdherenceBarRow(
            label = "Taken",
            count = taken,
            total = total,
            color = Success
        )

        Spacer(modifier = Modifier.height(8.dp))

        AdherenceBarRow(
            label = "Missed",
            count = missed,
            total = total,
            color = Error
        )

        Spacer(modifier = Modifier.height(8.dp))

        AdherenceBarRow(
            label = "Late",
            count = late,
            total = total,
            color = Warning
        )
    }
}

@Composable
private fun AdherenceBarRow(
    label: String,
    count: Int,
    total: Int,
    color: Color
) {
    val fraction = count.toFloat() / total

    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            modifier = Modifier.width(60.dp),
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.width(8.dp))

        Box(
            modifier = Modifier
                .weight(1f)
                .height(24.dp)
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                // Background
                drawRoundRect(
                    color = Color.LightGray.copy(alpha = 0.2f),
                    size = Size(this.size.width, this.size.height),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(12f, 12f)
                )
                // Progress
                if (fraction > 0) {
                    drawRoundRect(
                        color = color,
                        size = Size(this.size.width * fraction, this.size.height),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(12f, 12f)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.width(8.dp))

        Text(
            text = "$count",
            style = MaterialTheme.typography.bodyMedium,
            fontWeight = FontWeight.SemiBold,
            modifier = Modifier.width(32.dp),
            textAlign = TextAlign.End
        )
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    color: Color = MaterialTheme.colorScheme.primary,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier.padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = value,
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            color = color
        )
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = title,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
    }
}
