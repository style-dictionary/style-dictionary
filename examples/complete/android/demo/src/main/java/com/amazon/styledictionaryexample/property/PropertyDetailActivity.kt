package com.amazon.styledictionaryexample.property

import android.os.Bundle
import androidx.fragment.app.Fragment
import com.amazon.styledictionaryexample.BaseActivity
import com.amazon.styledictionaryexample.R
import com.amazon.styledictionaryexample.color.ColorDetailFragment
import com.amazon.styledictionaryexample.icon.IconDetailFragment

class PropertyDetailActivity : BaseActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_property_detail)

    // Show the Up button in the action bar.
    val actionBar = actionBar
    actionBar?.setDisplayHomeAsUpEnabled(true)
    if (savedInstanceState == null) {
      // Create the detail fragment and add it to the activity
      // using a fragment transaction.
      val path = intent.getStringArrayListExtra(ARG_PATH)
      val fragment: Fragment = when (path!![0]) {
        "color" -> ColorDetailFragment()
        "content" -> IconDetailFragment()
        else -> ColorDetailFragment()
      }
      supportFragmentManager
        .beginTransaction()
        .add(R.id.property_detail_container, fragment)
        .commit()
    }
  }

  companion object {
    const val ARG_PATH = "path"
  }
}