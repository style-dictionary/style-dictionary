package com.amazon.styledictionaryexample.color

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.amazon.styledictionaryexample.BaseActivity
import com.amazon.styledictionaryexample.R
import com.amazon.styledictionaryexample.color.BaseColorListItem.BaseColorHeaderItem
import com.amazon.styledictionaryexample.color.BaseColorListItem.BaseColorItem
import com.amazon.styledictionaryexample.models.StyleDictionaryNode
import com.amazon.styledictionaryexample.util.StyleDictionaryHelper
import java.util.*

class BaseColorActivity : BaseActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_base_color)
    val ab = actionBar
    ab?.setDisplayHomeAsUpEnabled(true)
    val recyclerView = findViewById<View>(R.id.base_color_list)!!
    (recyclerView as RecyclerView).adapter = SimpleItemRecyclerViewAdapter(allBaseColors)
  }

  private val baseColorList: ArrayList<StyleDictionaryNode>
    get() {
      val path = ArrayList<String>()
      path.add("color")
      path.add("base")
      return StyleDictionaryHelper.getArrayAtPath(path)
    }

  private val allBaseColors: ArrayList<BaseColorListItem>
    get() {
      val baseColors = baseColorList
      val allColors = ArrayList<BaseColorListItem>()
      val path = ArrayList<String>()
      path.add("color")
      path.add("base")
      for (node in baseColors) {
        if (node.name != "white" && node.name != "black") {
          path.add(node.name)
          path.add("500")
          val header = StyleDictionaryHelper.getProperty(path)
          allColors.add(BaseColorHeaderItem(header))
          path.removeAt(path.size - 1)
          val props = StyleDictionaryHelper.getArrayOfProps(path)
          for (prop in props) {
            allColors.add(BaseColorItem(prop))
          }
          path.removeAt(path.size - 1)
        }
      }
      return allColors
    }

  inner class SimpleItemRecyclerViewAdapter(private val values: List<BaseColorListItem>) :
    RecyclerView.Adapter<SimpleItemRecyclerViewAdapter.ViewHolder>() {
    override fun getItemViewType(position: Int): Int {
      return if (values[position].isHeader) {
        1
      } else {
        0
      }
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
      val view = when (viewType) {
        0 -> LayoutInflater.from(parent.context)
          .inflate(R.layout.base_color_list_content, parent, false)
        1 -> LayoutInflater.from(parent.context)
          .inflate(R.layout.base_color_list_header, parent, false)
        else -> LayoutInflater.from(parent.context)
          .inflate(R.layout.base_color_list_content, parent, false)
      }
      return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
      holder.item = values[position]
      with(values[position]) {

        val id = resources.getIdentifier(property.name, "color", packageName)
        val fontColor: Int = if (property.attributes["font"] == "inverse") {
          resources.getColor(R.color.color_font_inverse_base, null)
        } else {
          resources.getColor(R.color.color_font_base, null)
        }

        holder.titleView.text = title
        holder.titleView.setTextColor(fontColor)

        if (holder.valueView != null) {
          holder.valueView.text = subtitle
          holder.valueView.setTextColor(fontColor)
        }

        holder.view.setBackgroundColor(resources.getColor(id, null))
        holder.view.setOnClickListener {
        }
      }
    }

    override fun getItemCount(): Int {
      return values.size
    }

    inner class ViewHolder(val view: View) : RecyclerView.ViewHolder(view) {

      val titleView: TextView = view.findViewById(R.id.title)
      val valueView: TextView? = view.findViewById(R.id.value)

      var item: BaseColorListItem? = null

      override fun toString(): String {
        return super.toString() + " '${titleView.text} '"
      }

    }
  }
}