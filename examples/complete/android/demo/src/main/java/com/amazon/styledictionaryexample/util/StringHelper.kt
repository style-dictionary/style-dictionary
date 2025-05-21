package com.amazon.styledictionaryexample.util

object StringHelper {
  fun nameToDisplay(str: String): String {
    return str.replace("_".toRegex(), " ")
  }
}