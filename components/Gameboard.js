
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import  AsyncStorage  from '@react-native-async-storage/async-storage';
import Header from "./Header";
import Footer from "./Footer";
import styles from '../style/style';
import { NBR_OF_DICES, NBR_OF_THROWS, MIN_SPOT, MAX_SPOT, BONUS_POINTS_LIMIT, BONUS_POINTS, SCOREBOARD_KEY } from '../constants/Game';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Container, Row, Col } from 'react-native-flex-grid';

let board = [];

export default Gameboard = ({ navigation, route }) => {

    const [playerName, setPlayerName] = useState('');
    const [nbrOfThrowsLeft, setNbrOfThrowsLeft] = useState(NBR_OF_THROWS);
    const [status, setStatus] = useState('Throw dices');
    const [gameEndStatus, setGameEndStatus] = useState('');
    const [bonusStatus, setBonusStatus] = useState('');
    const [totalPoints, setTotalPoints] = useState(0);
    const [selectedDices, setSelectedDices] = useState(new Array(NBR_OF_DICES).fill(false));
    const [diceSpots, setDiceSpots] = useState(new Array(NBR_OF_DICES).fill(0));
    const [selectedDicePoints, setSelectedDicePoints] = useState(new Array(MAX_SPOT).fill(false));
    const [dicePointsTotal, setDicePointsTotal] = useState(new Array(MAX_SPOT).fill(0));
    const [scores, setScores] = useState([]);

    useEffect(() => {
        if (playerName === '' && route.params?.player) {
            setPlayerName(route.params.player);
        };
    }, []);

    useEffect(() => {
        checkWinner();
    }, [selectedDicePoints]);

    useEffect(() => {
       const unsubscribe = navigation.addListener('focus', () => {
           getScoreboardData();
       });
       return unsubscribe;
    }, [navigation]);

    const dicesRow = [];
    for ( let dice = 0; dice < NBR_OF_DICES; dice++ ) {
        dicesRow.push(
            <Col key={'dice' + dice}>
                <Pressable
                    key={'dice' + dice}
                    onPress={() => selectDice(dice)}>
                    <MaterialCommunityIcons 
                        name={board[dice]}
                        key={'dice' + dice}
                        size={50}
                        color={getDiceColor(dice)}
                    />
                </Pressable>
            </Col>
        );
    };

    const pointsRow = [];
    for ( let spot = 0; spot < MAX_SPOT; spot++ ) {
        pointsRow.push(
            <Col key={'pointsRow' + spot}>
                <Text key={'pointsRow' + spot}>{getSpotTotal(spot)}</Text>
            </Col>
        );
    };

    const pointsToSelectRow = [];
    for ( let diceButton = 0; diceButton < MAX_SPOT; diceButton++ ) {
        pointsToSelectRow.push(
            <Col key={'buttonsRow' + diceButton}>
                <Pressable
                    key={'buttonsRow' + diceButton}
                    onPress={() => selectDicePoints(diceButton)}
                    >
                    <MaterialCommunityIcons 
                        name={'numeric-' + (diceButton + 1) + '-circle'}
                        key={'buttonsRow' + diceButton}
                        size={35}
                        color={getDicePointsColor(diceButton)}
                    />
                </Pressable>
            </Col>
        );
    };

    const selectDicePoints = async(i) => {
        if (nbrOfThrowsLeft === 0) {
            let selectedPoints = [...selectedDicePoints];
            let points = [...dicePointsTotal];
            if (!selectedPoints[i]) {
                selectedPoints[i] = true;
                let nbrOfDices = diceSpots.reduce((total, x) => (x === (i + 1) ? total + 1: total), 0);
                points[i] = nbrOfDices * (i + 1);
            }
            else {
                setStatus('You already selected points for ' + (i + 1));
                return points[i];
            }
            setSelectedDicePoints(selectedPoints);
            setDicePointsTotal(points);
            setSelectedDices((new Array(MAX_SPOT).fill(false)));
            setNbrOfThrowsLeft(NBR_OF_THROWS);
            return points[i];
        }
        else {
            setStatus('Throw ' + NBR_OF_THROWS + ' times before setting points');
        }
    };

    const throwDices = () => {
        checkWinner();
        if (nbrOfThrowsLeft === 0) {
            setStatus('Select your points before the next throw');
            return 1;
        }
        let spots = [...diceSpots];
        for ( let i = 0; i < NBR_OF_DICES; i++ ) {
            if (!selectedDices[i]) {
                let randomNumber = Math.floor(Math.random() * 6 + 1);
                board[i] = 'dice-' + randomNumber;
                spots[i] = randomNumber;
            }
        }
        setNbrOfThrowsLeft(nbrOfThrowsLeft -1);
        setDiceSpots(spots);
        setStatus('Select and throw dices again');
    }

    function getSpotTotal(i) {
        return dicePointsTotal[i];
    };

    const selectDice = (i) => {
        if (nbrOfThrowsLeft < NBR_OF_THROWS) {
            let dices = [...selectedDices];
            dices[i] = selectedDices[i] ? false : true;
            setSelectedDices(dices);
        } 
        else {
            setStatus('You have to throw dices first')
        }
    };

    function getDiceColor(i) {
        return selectedDices[i] ? 'black' : '#f88a8a';
    };

    function getDicePointsColor(i) {
        return selectedDicePoints[i]  ? 'black' : '#f88a8a';
    };

    function checkWinner() {
        if (selectedDicePoints.every(((x) => x === true)) && totalPoints >= BONUS_POINTS_LIMIT) {
            setTotalPoints(dicePointsTotal.reduce((partialSum, a) => partialSum + a, 0));
            setTotalPoints(totalPoints + BONUS_POINTS);
            setBonusStatus('Congrats, you got the bonus! +50 points');
            gameOver();
        }
        else if (selectedDicePoints.every(((x) => x === true))) {
            setTotalPoints(dicePointsTotal.reduce((partialSum, a) => partialSum + a, 0));
            setBonusStatus('Sorry, you did not get bonus points.');
            gameOver();
        }
        else {
            setTotalPoints(dicePointsTotal.reduce((partialSum, a) => partialSum + a, 0));
            setGameEndStatus('');
        }
    }

    const gameOver = () => {
        setGameEndStatus('Game over, check your points and scoreboard!');
        setStatus('');
        setNbrOfThrowsLeft(0);
    }

    const day = new Date().getDate();
    const month = new Date().getMonth();
    const year = new Date().getFullYear();
    const date = (day + '.' + month + '.' + year);
    const hours = new Date().getHours();
    const minutes = new Date().getMinutes();
    const time = (hours + ':' + minutes);

    const savePlayerPoints = async() => {
        const newKey = scores.length +1;
        const playerPoints = {
            key: newKey,
            name: playerName,
            date: date,
            time: time,
            points: totalPoints,
        }
        try {
            const newScore = [...scores, playerPoints];
            const jsonValue = JSON.stringify(newScore);
            await AsyncStorage.setItem(SCOREBOARD_KEY, jsonValue);
        }
        catch(e) {
            console.log('Save error: ' + e);
        }
    }

    const getScoreboardData = async() => {
        try {
            const jsonValue = await AsyncStorage.getItem(SCOREBOARD_KEY);
            if (jsonValue !== null) {
                let tmpScores = JSON.parse(jsonValue);
                setScores(tmpScores);
            }
        }
        catch(e) {
            console.log('Read error: ' + e);
        }
    }

    const newGame = () => {
        setNbrOfThrowsLeft(NBR_OF_THROWS);
        setStatus('Throw dices');
        setGameEndStatus('');
        setBonusStatus('');
        setTotalPoints(0);
        setSelectedDices(new Array(NBR_OF_DICES).fill(false));
        setDiceSpots(new Array(NBR_OF_DICES).fill(0));
        setSelectedDicePoints(new Array(MAX_SPOT).fill(false));
        setDicePointsTotal(new Array(MAX_SPOT).fill(0));
    }

    return (
        <>
            <ScrollView>
            <Header />
            <View style={styles.container}>
                <Container fluid>
                    <Row>{dicesRow}</Row>
                </Container>
                <Container fluid>
                    <Text style={styles.gameinfo}>Throws left: {nbrOfThrowsLeft}</Text>
                </Container>
                <Container fluid>
                    <Text style={styles.gameinfo}>{status}</Text>
                </Container>
                <Container fluid>
                    <Pressable style={styles.button} onPress={() => throwDices()}>
                        <Text style={styles.buttonText}>THROW</Text>
                    </Pressable>
                </Container>
                <Container fluid>
                    <Text style={styles.gameEndStatus}>{gameEndStatus}</Text>
                </Container>
                <Container fluid>
                    <Text style={styles.gameinfo}>{bonusStatus}</Text>
                </Container>
                <Container fluid>
                    <Text style={styles.totalPoints}>Total points: {totalPoints}</Text>
                </Container>
                <Container fluid>
                    <Row style={styles.row}>{pointsRow}</Row>
                </Container>
                <Container fluid>
                    <Row style={styles.row}>{pointsToSelectRow}</Row>
                </Container>
                <Pressable style={styles.savePoints} onPress={() => savePlayerPoints()}>
                    <Text style={styles.buttonText}>Save points to scoreboard</Text>
                </Pressable>
                <Text style={styles.playerName}>Player: {playerName}</Text>
                <Pressable style={styles.newGame} onPress={() => newGame()}>
                    <Text style={styles.buttonText}>NEW GAME</Text>
                </Pressable>
            </View>
            <Footer />
            </ScrollView>
        </>
    )
}