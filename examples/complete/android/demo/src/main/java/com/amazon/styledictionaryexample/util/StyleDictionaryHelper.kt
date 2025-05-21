package com.amazon.styledictionaryexample.util

import android.content.Context
import com.amazon.styledictionaryexample.models.Property
import com.amazon.styledictionaryexample.models.StyleDictionaryNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsonorg.JsonOrgModule
import org.json.JSONException
import org.json.JSONObject
import java.nio.charset.Charset
import java.util.*

object StyleDictionaryHelper {
  private var MAPPER: ObjectMapper? = null
  private var DICTIONARY_JSON_STRING: String = ""
  var DICTIONARY_JSON: JSONObject? = null

  fun loadJSON(context: Context) {
    DICTIONARY_JSON_STRING = loadJsonFromAsset("data/properties.json", context)
    try {
      DICTIONARY_JSON = JSONObject(DICTIONARY_JSON_STRING)
    } catch (e: JSONException) {
      e.printStackTrace()
    }
  }

  fun getNodeArrayForObject(json: JSONObject?): ArrayList<StyleDictionaryNode> {
    val nodeList = ArrayList<StyleDictionaryNode>()
    val keys = json!!.keys()
    while (keys.hasNext()) {
      val key = keys.next()
      var isLeaf = false
      var count = 0
      try {
        val jsonNode = json.getJSONObject(key)
        if (jsonNode.has("value")) {
          isLeaf = true
        } else {
          count = jsonNode.length()
        }
      } catch (e: JSONException) {
        e.printStackTrace()
      }
      nodeList.add(StyleDictionaryNode(key, count, isLeaf))
    }
    return nodeList
  }

  fun getArrayAtPath(path: List<String>): ArrayList<StyleDictionaryNode> {
    val nodeList = ArrayList<StyleDictionaryNode>()
    var json = DICTIONARY_JSON
    try {
      for (pathPart in path) {
        json = json!!.getJSONObject(pathPart)
      }
      return getNodeArrayForObject(json)
    } catch (e: JSONException) {
      e.printStackTrace()
    }
    return nodeList
  }

  private fun getProperty(path: ArrayList<String>, jsonObject: JSONObject?): Property {
    var json = jsonObject
    val property: Property
    try {
      for (pathPart in path) {
        json = json!!.getJSONObject(pathPart)
      }
      return if (json!!.has("value")) {
        property = MAPPER!!.convertValue(json, Property::class.java)
        property
      } else {
        throw RuntimeException("Property doesn't exist")
      }
    } catch (e: JSONException) {
      e.printStackTrace()
      throw e
    }
  }

  fun getProperty(path: ArrayList<String>): Property {
    return getProperty(path, DICTIONARY_JSON)
  }

  fun getArrayOfProps(path: ArrayList<String>): ArrayList<Property> {
    val propertyList = ArrayList<Property>()
    var json = DICTIONARY_JSON
    try {
      for (pathPart in path) {
        json = json!!.getJSONObject(pathPart)
      }
      val keys = json!!.keys()
      while (keys.hasNext()) {
        val key = keys.next()
        val jsonProperty = json.getJSONObject(key)
        if (jsonProperty.has("value")) {
          val property = MAPPER!!.convertValue(jsonProperty, Property::class.java)
          propertyList.add(property)
        }
      }
    } catch (e: JSONException) {
      e.printStackTrace()
    }
    return propertyList
  }

  @Suppress("SameParameterValue")
  private fun loadJsonFromAsset(filename: String, context: Context): String {
    val inputStream = context.assets.open(filename)
    val size = inputStream.available()
    val buffer = ByteArray(size)
    inputStream.read(buffer)
    inputStream.close()
    return String(buffer, Charset.forName("UTF-8"))
  }

  init {
    MAPPER = ObjectMapper().registerModule(JsonOrgModule())
  }
}