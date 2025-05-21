package com.amazon.styledictionaryexample.icon

import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.amazon.styledictionaryexample.BaseActivity
import com.amazon.styledictionaryexample.R
import com.amazon.styledictionaryexample.models.Property
import com.amazon.styledictionaryexample.util.StringHelper
import com.amazon.styledictionaryexample.util.StyleDictionaryHelper
import java.util.*

/**
 * An activity representing a list of Icons.
 */
class IconListActivity : BaseActivity() {
  private var iconFont: Typeface? = null
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    setContentView(R.layout.activity_icon_list)
    // Show the Up button in the action bar.
    val actionBar = actionBar
    actionBar?.setDisplayHomeAsUpEnabled(true)
    iconFont = Typeface.createFromAsset(assets, "fonts/MaterialIcons-Regular.ttf")
    val recyclerView = findViewById<View>(R.id.icon_list)!!
    (recyclerView as RecyclerView).adapter =
      SimpleItemRecyclerViewAdapter(
        iconList)
  }

  private val iconList: ArrayList<Property>
    get() {
      val path = ArrayList<String>()
      path.add("content")
      path.add("icon")
      return StyleDictionaryHelper.getArrayOfProps(path)
    }

  inner class SimpleItemRecyclerViewAdapter(private val mValues: List<Property>) :
    RecyclerView.Adapter<SimpleItemRecyclerViewAdapter.ViewHolder>() {
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
      val view = LayoutInflater.from(parent.context)
        .inflate(R.layout.icon_list_content, parent, false)
      return ViewHolder(view)
    }

    override fun onBindViewHolder(holder: ViewHolder, position: Int) {
      holder.item = mValues[position]
        .apply {
          holder.iconView.text = value
          holder.titleView.text = StringHelper.nameToDisplay(attributes["item"]!!)
          holder.view.setOnClickListener { v ->
            val context = v.context
            val intent = Intent(context, IconDetailActivity::class.java)
            intent.putStringArrayListExtra(
              IconDetailFragment.ARG_ITEM_PATH,
              ArrayList(this.path))
            context.startActivity(intent)
          }
        }
    }

    override fun getItemCount(): Int {
      return mValues.size
    }

    inner class ViewHolder(val view: View) : RecyclerView.ViewHolder(view) {
      var iconView: TextView = view.findViewById(R.id.icon)
      var titleView: TextView = view.findViewById(R.id.title)
      var item: Property? = null
      override fun toString(): String {
        return super.toString() + " '" + titleView.text + "'"
      }

      init {
        iconView.typeface = iconFont
      }
    }
  }
}