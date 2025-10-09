package com.styledictionaryexample.property

import android.content.Context
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import androidx.fragment.app.Fragment
import androidx.recyclerview.widget.RecyclerView
import com.styledictionaryexample.R
import com.styledictionaryexample.models.StyleDictionaryNode
import com.styledictionaryexample.property.PropertyFragment.OnListFragmentInteractionListener
import com.styledictionaryexample.util.StyleDictionaryHelper
import java.util.*

/**
 * A fragment representing a list of Items.
 *
 *
 * Activities containing this fragment MUST implement the [OnListFragmentInteractionListener]
 * interface.
 */
class PropertyFragment : Fragment() {
  private var mListener: OnListFragmentInteractionListener? = null
  private var nodeList: ArrayList<StyleDictionaryNode> =
    StyleDictionaryHelper.getNodeArrayForObject(StyleDictionaryHelper.DICTIONARY_JSON)

  override fun onCreateView(
    inflater: LayoutInflater,
    container: ViewGroup?,
    savedInstanceState: Bundle?
  ): View? {
    val view = inflater.inflate(R.layout.fragment_property_list, container, false)

    // Set the adapter
    if (view is RecyclerView) {
      view.adapter = PropertyRecyclerViewAdapter(nodeList, mListener)
    }
    return view
  }

  override fun onAttach(context: Context) {
    super.onAttach(context)
    mListener = if (context is OnListFragmentInteractionListener) {
      context
    } else {
      throw RuntimeException(
        context.toString()
          + " must implement OnListFragmentInteractionListener")
    }
  }

  override fun onDetach() {
    super.onDetach()
    mListener = null
  }

  /**
   * This interface must be implemented by activities that contain this
   * fragment to allow an interaction in this fragment to be communicated
   * to the activity and potentially other fragments contained in that
   * activity.
   *
   *
   * See the Android Training lesson [Communicating with Other Fragments](http://developer.android.com/training/basics/fragments/communicating.html) for more information.
   */
  interface OnListFragmentInteractionListener {
    fun onListFragmentInteraction(item: StyleDictionaryNode?)
  }

  companion object {
    fun newInstance(nodeList: ArrayList<StyleDictionaryNode>): PropertyFragment {
      val fragment = PropertyFragment()
      fragment.nodeList = nodeList
      return fragment
    }
  }

}