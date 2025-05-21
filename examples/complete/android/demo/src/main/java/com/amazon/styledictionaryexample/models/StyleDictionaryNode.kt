package com.amazon.styledictionaryexample.models

data class StyleDictionaryNode(
  val name: String,
  val count: Int = 0,
  val isLeaf: Boolean = false
)