@file:Suppress("UNUSED_PARAMETER")

package com.amazon.styledictionaryexample.color

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.Button
import com.amazon.styledictionaryexample.BaseActivity
import com.amazon.styledictionaryexample.R

class ColorsActivity : BaseActivity() {
  private var baseButton: Button? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_colors)
    baseButton = findViewById(R.id.activity_colors_base_button)
  }

  fun baseButton(view: View?) {
    val baseColorIntent = Intent(this, BaseColorActivity::class.java)
    startActivity(baseColorIntent)
  }

  fun backgroundButton(view: View?) {
    val backgroundColorIntent = Intent(this, BackgroundColorActivity::class.java)
    startActivity(backgroundColorIntent)
  }

  fun fontButton(view: View?) {
    val fontColorIntent = Intent(this, FontColorActivity::class.java)
    startActivity(fontColorIntent)
  }
}