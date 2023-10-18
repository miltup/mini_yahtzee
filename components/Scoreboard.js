import { useState, useEffect } from 'react';
import { Text, View, Pressable } from 'react-native';
import  AsyncStorage  from '@react-native-async-storage/async-storage';
import { DataTable } from 'react-native-paper';
import Header from "./Header";
import Footer from "./Footer";
import { NBR_OF_SCOREBOARD_ROWS, SCOREBOARD_KEY } from '../constants/Game';
import styles from '../style/style';

export default Scoreboard = ({ navigation }) => {

    const [scores, setScores] = useState([]);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            getScoreboardData();
        });
        return unsubscribe;
    }, [navigation]);

    const getScoreboardData = async() => {
        try {
            const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
            if (jsonValue !== null) {
                let tmpScores = JSON.parse(jsonValue);
                setScores(tmpScores);
                //const scoresOrder = [...scores].sort((a, b) => b.points - a.points);
                //console.log(scoresOrder);
            }
        }
        catch(e) {
            console.log('Read error: ' + e);
        }
    }

    const clearScoreboard = async() => {
        try {
            await AsyncStorage.clear();
            setScores([]);
        }
        catch(e) {
            console.log('Clear error: ' + e);
        }
    }

    return (
        <>
            <Header />
                <View>
                    {scores.length === 0 ? 
                        <Text>Scoreboard is empty</Text>
                        :
                        scores.sort((a, b) => b.points - a.points).map((player, index) => (
                            index < NBR_OF_SCOREBOARD_ROWS && 
                            <DataTable.Row key={player.key}>
                                <DataTable.Cell><Text style={styles.dataTable}>{index + 1}.</Text></DataTable.Cell>
                                <DataTable.Cell><Text style={styles.dataTable}>{player.name}</Text></DataTable.Cell>
                                <DataTable.Cell><Text style={styles.dataTable}>{player.date}</Text></DataTable.Cell>
                                <DataTable.Cell><Text style={styles.dataTable}>{player.time}</Text></DataTable.Cell>
                                <DataTable.Cell><Text style={styles.dataTable}>Points: {player.points}</Text></DataTable.Cell>
                            </DataTable.Row>
                        ))
                    }
                </View>
                <View style={styles.container}>
                    <Pressable style={styles.clearButton} onPress={() => clearScoreboard()}>
                        <Text style={styles.buttonText}>CLEAR SCOREBOARD</Text>
                    </Pressable>
                </View>
            <Footer />
        </>
    )
}