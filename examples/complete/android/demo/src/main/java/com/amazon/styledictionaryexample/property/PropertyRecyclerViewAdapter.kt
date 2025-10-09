package com.styledictionaryexample.property

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.styledictionaryexample.R
import com.styledictionaryexample.models.StyleDictionaryNode
import com.styledictionaryexample.property.PropertyFragment.OnListFragmentInteractionListener

/**
 * [RecyclerView.Adapter] that can display a [StyleDictionaryNode] and makes a call to the
 * specified [OnListFragmentInteractionListener].
 */
class PropertyRecyclerViewAdapter(
  private val values: List<StyleDictionaryNode>,
  private val listener: OnListFragmentInteractionListener?
) : RecyclerView.Adapter<PropertyRecyclerViewAdapter.ViewHolder>() {
  override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
    val view = LayoutInflater.from(parent.context)
      .inflate(R.layout.fragment_property_list_item, parent, false)
    return ViewHolder(view)
  }

  override fun onBindViewHolder(holder: ViewHolder, position: Int) {
    holder.item = values[position]
    holder.idView.text = values[position].name
    if (!values[position].isLeaf) {
      holder.contentView.text = java.lang.String.valueOf(values[position].count)
    }
    holder.view.setOnClickListener { listener?.onListFragmentInteraction(holder.item) }
  }

  override fun getItemCount(): Int {
    return values.size
  }

  inner class ViewHolder(val view: View) : RecyclerView.ViewHolder(
    view) {
    val idView: TextView = view.findViewById<View>(R.id.id) as TextView
    val contentView: TextView = view.findViewById<View>(R.id.content) as TextView

    var item: StyleDictionaryNode? = null

    override fun toString(): String {
      return super.toString() + " '" + contentView.text + "'"
    }

  }
}