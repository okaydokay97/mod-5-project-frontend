import React, { Component } from "react";
import { Text, SafeAreaView, StyleSheet, View, ScrollView } from "react-native";
import { connect } from 'react-redux'
import styles from '../styles/styles'
import { Searchbar, List } from 'react-native-paper'
import { Card, ListItem, Button, Icon } from 'react-native-elements'
import { addPantryIngredient } from '../actions/addPantryIngredient'


class AddIngredients extends Component {

  constructor(props) {
    super(props)
    this.state = {
      searchQuery: '',
      ingredients: []
    }
  }

  render() {
    if (this.state.ingredients.length === 0) {
      return (
        <SafeAreaView>
          <Searchbar
            placeholder='Search ingredients'
            onChangeText={this.handleChangeText}
            value={this.state.searchQuery}
            onIconPress={this.handleSearch}
            onBlur={this.handleSearch}
          />
        </SafeAreaView>
      )
    } else {
      return (
        <SafeAreaView>
          <Searchbar
            placeholder='Search ingredients'
            onChangeText={this.handleChangeText}
            value={this.state.searchQuery}
            onIconPress={this.handleSearch}
            onBlur={this.handleSearch}
          />
          <ScrollView>
            {this.state.ingredients.map((i, index) => {
              return (
                <Card key={index} containerStyle={{ padding: 0 }}>
                  <ListItem
                    roundAvatar
                    title={i.name}
                    leftAvatar={{ source: { uri: `https://spoonacular.com/cdn/ingredients_100x100/${i.image}` } }}
                    rightAvatar={<Button onPress={() => this.handleAdd(i)} title='+' />}
                  />
                </Card>)
            })}
          </ScrollView>
        </SafeAreaView>
      );
    }
  }



  handleAdd = (ingredient) => {
    ingredient.currentUser = this.props.currentUser
    fetch('http://localhost:3000/pantry_ingredients', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(ingredient)
    })
      .then(resp => resp.json())
      .then(async ingredient => {
        if (ingredient.error) {
          alert(ingredient.error)
        } else {
          await this.props.addPantryIngredient(ingredient)
        }
      })
  }


  handleSearch = () => {
    fetch('http://localhost:3000/ingredients_filter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(this.state.searchQuery)
    })
      .then(resp => resp.json())
      .then(async foundIngredients => {
        if (foundIngredients.length < 20) {
          fetch(`https://api.spoonacular.com/food/ingredients/autocomplete?apiKey=e399eab9a8694529b8ff1e1b1a0bf1ff&query=${this.state.searchQuery}&number=20&metaInformation=true`)
            .then(resp => resp.json())
            .then(data => {
              fetch('http://localhost:3000/ingredients', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
              })
                .then(resp => resp.json())
                .then(async foundIngredients => {
                  await this.setState({
                    ingredients: foundIngredients
                  })
                  // console.log(this.state)
                })
            })
        } else {
          await this.setState({
            ingredients: foundIngredients
          })
          // console.log(this.state)
        }
      })
  }


  handleChangeText = (event) => {
    this.setState({
      searchQuery: event
    })
  }

}

const mapStateToProps = (state) => {
  return {
    currentUser: state.currentUser,
    pantry_ingredients: state.pantry_ingredients
  }
}

const mapDispatchToProps = {
  addPantryIngredient
}

export default connect(mapStateToProps, mapDispatchToProps)(AddIngredients)