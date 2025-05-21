package com.amazon.styledictionaryexample.color

import android.annotation.SuppressLint
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.fragment.app.Fragment
import com.amazon.styledictionaryexample.R
import com.amazon.styledictionaryexample.models.Property
import com.amazon.styledictionaryexample.property.PropertyDetailActivity
import com.amazon.styledictionaryexample.util.StringHelper
import com.amazon.styledictionaryexample.util.StyleDictionaryHelper

class ColorDetailFragment : Fragment() {
  private var property: Property? = null
  private var swatch: View? = null
  private var title: TextView? = null
  private var body: TextView? = null

  @SuppressLint("SetTextI18n")
  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    // Inflate the layout for this fragment
    val view = inflater.inflate(R.layout.fragment_color_detail, container, false)
    swatch = view.findViewById(R.id.color_swatch)
    title = view.findViewById(R.id.color_title)
    body = view.findViewById(R.id.color_detail_body)
    val path = activity?.intent?.getStringArrayListExtra(PropertyDetailActivity.ARG_PATH)
    if (path != null) {
      property = StyleDictionaryHelper.getProperty(path).apply {
        val id = resources.getIdentifier(name, "color", activity?.packageName)
        swatch?.setBackgroundColor(resources.getColor(id, null))
        title?.text = getTitle()
        body?.text = "@color/${property?.name}"
      }
    }
    return view
  }

  private fun Property.getTitle(): String {
    return when (attributes["type"]) {
      "base" -> StringHelper.nameToDisplay(attributes["item"].orEmpty()) + " " + attributes["subitem"]
      else -> StringHelper.nameToDisplay(attributes["item"].orEmpty()) + " " + attributes["subitem"]
    }
  }
}