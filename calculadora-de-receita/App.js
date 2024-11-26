import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  Alert, 
  StyleSheet, 
  BackHandler 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
  const [menu, setMenu] = useState('home');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expense, setExpense] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [calculatedData, setCalculatedData] = useState(null);

  useEffect(() => {
    const backAction = () => {
      if (menu !== 'home') {
        setMenu('home');
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, [menu]);

  useEffect(() => {
    const loadRecipes = async () => {
      const storedRecipes = await AsyncStorage.getItem('recipes');
      if (storedRecipes) setRecipes(JSON.parse(storedRecipes));
    };
    loadRecipes();
  }, []);

  const saveRecipes = async (newRecipes) => {
    await AsyncStorage.setItem('recipes', JSON.stringify(newRecipes));
  };

  const calculateDirectly = () => {
    if (!expense || !quantity || !unitPrice) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const totalExpense = parseFloat(expense);
    const totalSales = parseFloat(quantity) * parseFloat(unitPrice);
    const profit = totalSales - totalExpense;
    const profitPercentage = (profit / totalExpense) * 100;

    setCalculatedData({
      totalExpense,
      totalSales,
      profit,
      profitPercentage,
    });
  };

  const addRecipe = () => {
    if (!expense || !quantity || !unitPrice) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    const totalExpense = parseFloat(expense);
    const totalSales = parseFloat(quantity) * parseFloat(unitPrice);
    const profit = totalSales - totalExpense;
    const profitPercentage = (profit / totalExpense) * 100;

    const newRecipe = {
      id: Date.now(),
      title: title || 'Receita',
      description,
      totalExpense,
      totalSales,
      profit,
      profitPercentage,
      quantity: parseInt(quantity),
    };

    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);

    setTitle('');
    setDescription('');
    setExpense('');
    setQuantity('');
    setUnitPrice('');
    setCalculatedData(null);
    setMenu('recipes');
  };

  const deleteRecipe = (id) => {
    const updatedRecipes = recipes.filter((recipe) => recipe.id !== id);
    setRecipes(updatedRecipes);
    saveRecipes(updatedRecipes);
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.recipe}>
      <Text style={styles.recipeTitle}>{item.title}</Text>
      {item.description ? <Text style={styles.text}>{item.description}</Text> : null}
      <Text style={styles.text}>Quantidade Produzida: {item.quantity}</Text>
      <Text style={styles.text}>Gasto Total: R${item.totalExpense.toFixed(2)}</Text>
      <Text style={styles.text}>Preço Total de Venda: R${item.totalSales.toFixed(2)}</Text>
      <Text style={styles.text}>Lucro: R${item.profit.toFixed(2)}</Text>
      <Text style={styles.text}>Lucro (%): {item.profitPercentage.toFixed(2)}%</Text>
      <TouchableOpacity onPress={() => deleteRecipe(item.id)}>
        <Text style={styles.deleteButton}>Excluir</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {menu === 'home' && (
        <View style={styles.centeredView}>
          <Text style={styles.title}>Calculadora de Receitas</Text>
          <TouchableOpacity onPress={() => setMenu('newRecipe')}>
            <Text style={styles.menuButton}>Nova Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenu('recipes')}>
            <Text style={styles.menuButton}>Minhas Receitas</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMenu('about')}>
            <Text style={styles.menuButton}>Sobre o App</Text>
          </TouchableOpacity>
        </View>
      )}

      {menu === 'newRecipe' && (
        <View style={styles.centeredView}>
          <Text style={styles.title}>Nova Receita</Text>
          <TextInput
            style={styles.input}
            placeholder="Título (opcional)"
            value={title}
            onChangeText={setTitle}
          />
          <TextInput
            style={styles.input}
            placeholder="Descrição (opcional)"
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Gasto Total (R$)"
            value={expense}
            onChangeText={setExpense}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Quantidade Produzida"
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Preço de Venda (R$)"
            value={unitPrice}
            onChangeText={setUnitPrice}
            keyboardType="numeric"
          />
          <TouchableOpacity onPress={calculateDirectly}>
            <Text style={styles.calculateButton}>Calcular Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={addRecipe}>
            <Text style={styles.addButton}>Salvar Receita</Text>
          </TouchableOpacity>
          {calculatedData && (
            <View style={styles.calculationResults}>
              <Text style={styles.text}>Gasto Total: R${calculatedData.totalExpense.toFixed(2)}</Text>
              <Text style={styles.text}>Preço Total de Venda: R${calculatedData.totalSales.toFixed(2)}</Text>
              <Text style={styles.text}>Lucro: R${calculatedData.profit.toFixed(2)}</Text>
              <Text style={styles.text}>Lucro (%): {calculatedData.profitPercentage.toFixed(2)}%</Text>
            </View>
          )}
          <TouchableOpacity onPress={() => setMenu('home')}>
            <Text style={styles.backButton}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {menu === 'recipes' && (
        <View style={styles.centeredView}>
          <Text style={styles.title}>Minhas Receitas</Text>
          <FlatList
            data={recipes}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRecipe}
          />
          <TouchableOpacity onPress={() => setMenu('home')}>
            <Text style={styles.backButton}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}

      {menu === 'about' && (
        <View style={styles.centeredView}>
          <Text style={styles.title}>Sobre o App</Text>
          <Text style={styles.aboutText}>Este app foi criado para o projeto de extensão da Universidade Estácio de Sá, do curso Engenharia de Software e da disciplina Programação Para Dispositivos Móveis em Android, pelo aluno Deyvid Wellington, para ajudar a calcular os lucros de uma receita produzida que o usuário for vender. Ele pega os gastos da sua receita, a quantidade produzida e o preço que você for vender para lhe dar o lucro da venda dos produtos em reais e em porcentagem.</Text>
          <TouchableOpacity onPress={() => setMenu('home')}>
            <Text style={styles.backButton}>Voltar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centeredView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, width: '100%', padding: 10, marginBottom: 10, borderRadius: 5 },
  calculateButton: { color: 'orange', textAlign: 'center', marginTop: 10 },
  addButton: { color: 'green', textAlign: 'center', marginTop: 10 },
  backButton: { color: 'blue', textAlign: 'center', marginTop: 10 },
  menuButton: { fontSize: 18, color: 'blue', marginVertical: 10, textAlign: 'center' },
  recipe: { marginBottom: 20, padding: 10, borderWidth: 1, borderRadius: 5, width: '100%' },
  recipeTitle: { fontWeight: 'bold', fontSize: 18, textAlign: 'center' },
  text: { textAlign: 'center', marginVertical: 5 },
  deleteButton: { color: 'red', marginTop: 10, textAlign: 'center' },
  calculationResults: { marginTop: 20 },
  aboutText: { fontSize: 23, textAlign: 'center', marginVertical: 10 },
});
