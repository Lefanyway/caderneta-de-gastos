import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_GASTOS = '@caderneta_gastos';
const fonte = Platform.OS === 'android' ? 'serif' : 'Georgia';

export default function App() {
  const [gastos, setGastos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [tela, setTela] = useState('lista');
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarGastos() {
      try {
        const dadosSalvos = await AsyncStorage.getItem(CHAVE_GASTOS);
        if (dadosSalvos) {
          setGastos(JSON.parse(dadosSalvos));
        }
      } catch (error) {
        console.log('Não foi possível carregar os gastos.');
      } finally {
        setCarregando(false);
      }
    }

    carregarGastos();
  }, []);

  useEffect(() => {
    if (!carregando) {
      AsyncStorage.setItem(CHAVE_GASTOS, JSON.stringify(gastos)).catch(() => {
        console.log('Não foi possível salvar os gastos.');
      });
    }
  }, [gastos, carregando]);

  function salvarGasto() {
    const descricaoDigitada = descricao.trim();
    const valorDigitado = Number(valor.replace(',', '.'));

    if (!descricaoDigitada) {
      setErro('Digite a descrição do gasto.');
      return;
    }

    if (!valor.trim() || Number.isNaN(valorDigitado) || valorDigitado <= 0) {
      setErro('Digite um valor maior que zero.');
      return;
    }

    const novoGasto = {
      id: Date.now().toString(),
      descricao: descricaoDigitada,
      valor: valorDigitado,
    };

    setGastos((listaAtual) => [...listaAtual, novoGasto]);
    setDescricao('');
    setValor('');
    setErro('');
    setTela('lista');
  }

  function excluirGasto(id) {
    setGastos((listaAtual) => listaAtual.filter((gasto) => gasto.id !== id));
  }

  const total = gastos.reduce((soma, gasto) => soma + gasto.valor, 0);

  if (carregando) {
    return (
      <SafeAreaView style={styles.centro}>
        <ActivityIndicator size="large" color="#000000" />
      </SafeAreaView>
    );
  }

  if (tela === 'formulario') {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.conteudo}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable onPress={() => setTela('lista')}>
            <Text style={styles.voltar}>← Voltar</Text>
          </Pressable>
          <Text style={styles.titulo}>Novo gasto</Text>

          <Text style={styles.rotulo}>Descrição</Text>
          <TextInput
            style={styles.campo}
            placeholder="Ex.: almoço"
            value={descricao}
            onChangeText={setDescricao}
            maxLength={60}
          />

          <Text style={styles.rotulo}>Valor (R$)</Text>
          <TextInput
            style={styles.campo}
            placeholder="Ex.: 25,50"
            value={valor}
            onChangeText={setValor}
            keyboardType="decimal-pad"
          />

          {erro ? <Text style={styles.erro}>{erro}</Text> : null}

          <Pressable style={styles.botao} onPress={salvarGasto}>
            <Text style={styles.textoBotao}>Salvar</Text>
          </Pressable>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.conteudo}>
        <Text style={styles.titulo}>Caderneta de Gastos</Text>

        <View style={styles.cartaoTotal}>
          <Text style={styles.textoTotal}>Total gasto</Text>
          <Text style={styles.valorTotal}>
            {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </Text>
        </View>

        <Pressable style={styles.botao} onPress={() => setTela('formulario')}>
          <Text style={styles.textoBotao}>+ Adicionar gasto</Text>
        </Pressable>

        <FlatList
          style={styles.lista}
          data={gastos}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={styles.vazio}>Nenhum gasto anotado ainda.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.detalhesItem}>
                <Text style={styles.descricaoItem}>{item.descricao}</Text>
                <Text style={styles.valorItem}>
                  {item.valor.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })}
                </Text>
              </View>
              <Pressable onPress={() => excluirGasto(item.id)}>
                <Text style={styles.excluir}>Excluir</Text>
              </Pressable>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  conteudo: {
    flex: 1,
    padding: 24,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: fonte,
    color: '#000000',
    marginBottom: 18,
  },
  cartaoTotal: {
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#000000',
  },
  textoTotal: {
    color: '#000000',
    fontSize: 14,
    fontFamily: fonte,
  },
  valorTotal: {
    color: '#000000',
    fontSize: 24,
    fontWeight: '400',
    fontFamily: fonte,
    marginTop: 4,
  },
  botao: {
    backgroundColor: '#000000',
    borderRadius: 6,
    padding: 13,
    alignItems: 'center',
    marginBottom: 18,
  },
  textoBotao: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '400',
    fontFamily: fonte,
  },
  lista: {
    flex: 1,
  },
  item: {
    backgroundColor: 'transparent',
    borderBottomColor: '#000000',
    borderBottomWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detalhesItem: {
    flex: 1,
  },
  descricaoItem: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    fontFamily: fonte,
  },
  valorItem: {
    fontSize: 14,
    color: '#000000',
    fontFamily: fonte,
    marginTop: 4,
  },
  excluir: {
    color: '#000000',
    padding: 8,
    fontFamily: fonte,
  },
  vazio: {
    textAlign: 'center',
    color: '#000000',
    fontFamily: fonte,
    marginTop: 32,
  },
  voltar: {
    color: '#000000',
    fontSize: 16,
    fontFamily: fonte,
    marginBottom: 20,
  },
  rotulo: {
    color: '#000000',
    fontSize: 15,
    fontFamily: fonte,
    marginBottom: 7,
  },
  campo: {
    backgroundColor: '#ffffff',
    borderColor: '#000000',
    borderWidth: 1,
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
    fontFamily: fonte,
    marginBottom: 18,
  },
  erro: {
    color: '#000000',
    fontFamily: fonte,
    marginBottom: 14,
  },
});

