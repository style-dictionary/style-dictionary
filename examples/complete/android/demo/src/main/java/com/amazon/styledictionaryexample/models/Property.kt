package com.amazon.styledictionaryexample.models

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties("original", "filePath", "isSource")
data class Property(
  var name: String = "",
  var value: String ="",
  var attributes: Map<String, String> = mutableMapOf(),
  var path: List<String> = emptyList()
)
