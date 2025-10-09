package com.styledictionaryexample.color

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.styledictionaryexample.BaseActivity
import com.styledictionaryexample.R
import com.styledictionaryexample.models.Property
import com.styledictionaryexample.util.StyleDictionaryHelper
import java.util.*

class FontColorActivity : BaseActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_font_color)
    val recyclerView = findViewById<View>(R.id.font_color_list)!!
    (recyclerView as RecyclerView).adapter =
      SimpleItemRecyclerViewAdapter(
        fontColors)
  }

  private val fontColors: ArrayList<Property>
    get() {
      val path = ArrayList<String>()
      path.add("color")
      path.add("font")
      return StyleDictionaryHelper.getArrayOfProps(path)
    }

  inner class SimpleItemRecyclerViewAdapter(private val mValues: List<Property>) :
    RecyclerView.Adapter<SimpleItemRecyclerViewAdapter.ViewHolder>() {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
      val view = LayoutInflater.from(parent.context)
        .inflate(R.layout.background_color_list_item, parent, false)
      return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
      holder.item = mValues[position]
        .apply {

          val id = resources.getIdentifier(name, "color", packageName)
          holder.swatchView.setBackgroundColor(resources.getColor(id, null))
          holder.titleView.text = attributes["item"]
      }
    }

    override fun getItemCount(): Int {
      return mValues.size
    }

    inner class ViewHolder(val view: View) : RecyclerView.ViewHolder(view) {
      var swatchView: View = view.findViewById(R.id.swatch)
      var titleView: TextView = view.findViewById(R.id.title)

      var item: Property? = null
      override fun toString(): String {
        return super.toString() + " '" + titleView.text + "'"
      }

    }
  }
}