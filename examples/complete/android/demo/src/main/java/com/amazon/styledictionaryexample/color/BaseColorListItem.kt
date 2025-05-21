package com.amazon.styledictionaryexample.color

import com.amazon.styledictionaryexample.models.Property

interface BaseColorListItem {
  val isHeader: Boolean
  val title: String?
  val subtitle: String
  val property: Property

  class BaseColorItem(override val property: Property) : BaseColorListItem {
    override val title: String? = property.attributes["subitem"]
    override val subtitle: String = property.value

    override val isHeader: Boolean
      get() = false
  }

  class BaseColorHeaderItem(override var property: Property) : BaseColorListItem {
    override val title: String? = property.attributes["item"]
    override val subtitle: String = property.name

    override val isHeader: Boolean
      get() = true
  }
}