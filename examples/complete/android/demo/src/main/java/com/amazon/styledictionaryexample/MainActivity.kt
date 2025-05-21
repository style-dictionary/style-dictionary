package com.amazon.styledictionaryexample

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.View
import android.widget.Button
import com.amazon.styledictionaryexample.color.ColorsActivity
import com.amazon.styledictionaryexample.icon.IconListActivity
import com.amazon.styledictionaryexample.property.PropertiesActivity
import com.amazon.styledictionaryexample.util.StyleDictionaryHelper

@Suppress("UNUSED_PARAMETER")
class MainActivity : BaseActivity() {
  private var propertiesButton: Button? = null
  private var colorsButton: Button? = null

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_main)
    StyleDictionaryHelper.loadJSON(this)
    propertiesButton = findViewById(R.id.activity_main_properties_button)
    colorsButton = findViewById(R.id.activity_main_colors_button)
  }

  fun colorsButton(view: View) {
    val colorsIntent = Intent(this, ColorsActivity::class.java)
    startActivity(colorsIntent)
  }

  fun propertiesButton(view: View) {
    val propertiesIntent = Intent(this, PropertiesActivity::class.java)
    startActivity(propertiesIntent)
  }

  fun iconsButton(view: View) {
    val iconsIntent = Intent(this, IconListActivity::class.java)
    startActivity(iconsIntent)
  }
}