import './App.css';
import { Line, LineChart, Tooltip, XAxis, YAxis} from "recharts";
import rawData from './price.json';
import jul_icon from './JULC.png';
import om_icon from './olympique-de-marseille.svg';
import {useEffect, useRef, useState} from "react";

function App() {
    const [graphValues, setGraphValues] = useState({data: [0], ticks: [0], rotation: -1, min: 0, max: 0, time: ''})
    const [chartWidth, setChartWidth] = useState(0);
    const [chartHeight, setChartHeight] = useState(0);
    const [graphHeight, setGraphHeight] = useState(0);

    const containerRef = useRef(null);
    const graphRef = useRef(null);

    useEffect(() => {
        if (graphRef.current) {
            const forcedReflow = graphRef.current.clientHeight; // Force reflow
            setGraphHeight(graphRef.current.clientHeight);
            console.log("New graph height:", graphRef.current.clientHeight);
        }
    }, [graphRef.current]);

    useEffect(() => {
        const handleResize = () => {
            if (containerRef.current) {
                const forcedReflow = containerRef.current.offsetHeight; // Force reflow
                setChartHeight(containerRef.current.offsetHeight * 0.7);
                setChartWidth(containerRef.current.offsetWidth * 0.9);
            }
            if (graphRef.current) {
                const forcedReflow = graphRef.current.clientHeight; // Force reflow
                setGraphHeight(graphRef.current.clientHeight);
                console.log("New graph height:", graphRef.current.clientHeight);
            }

            console.log(graphHeight)
        };

        window.addEventListener('resize', handleResize);

        // Set initial size
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const prices = rawData.Data.Data
        .map(obj  => {
            return { price: obj.open }
        })

    const updateGraphValues = (i) => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const time = `${hours}:${minutes}:${seconds}`;

        const data = prices.slice(i, i + 240);

        const min = Math.min(...data.map(o => o.price));
        const max = Math.max(...data.map(o => o.price));

        const stepSize = (max - min) / 4;
        const ticks = [];
        for (let i = 0; i < 5; i++) {
            ticks.push(Math.round(min + i * stepSize))
        }

        setGraphValues(prevValues => ({
            ...prevValues, // Spread the previous values to retain them
            data,
            ticks,
            rotation: prevValues.rotation === 1 ? -1 : 1, // Alternate between -1 and 1
            min,
            max,
            time
        }));
    }

    useEffect(() => {
        let i = 0;
        updateGraphValues(i);

        const interval = setInterval(() => {
            updateGraphValues(i);
            i++;
        }, 500);

        return () => clearInterval(interval); // eslint-disable-next-line
    }, []);


    return (
        <div className="App" >
            <header className="App-header" ref={containerRef}>
                <div className={"App-title"}>
                    <img src={jul_icon} width={55} height={70} style={{ transform: `rotate(${graphValues.rotation * 30}deg)`}} alt={"JUL DE TP"}/>
                    <h1>JUL-USDC</h1>
                    <img src={om_icon} width={60 + graphValues.rotation * 10} height={80 + graphValues.rotation * 20}  alt={"ALLEZ L'OM"}/>
                </div>
                <section className={"graph-container"}>
                    <div ref={graphRef} style={{position: "relative"}}>
                        <LineChart width={chartWidth} height={chartHeight} data={graphValues.data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
                            <XAxis dataKey={"a"} label={{ value: graphValues.time, position: 'insideBottom', offset: -5 }}/>
                            <YAxis domain={[graphValues.min, graphValues.max]} ticks={graphValues.ticks}/>
                            <Tooltip isAnimationActive={false}/>
                            <Line
                                dataKey="price"
                                stroke={(graphValues.data[0].price < graphValues.data[graphValues.data.length - 1].price ? '#098551' : '#CF202F')}
                                strokeWidth={3}
                                dot={false}
                                isAnimationActive={false}
                            />
                        </LineChart>
                        <img className={"jul-cursor"} src={jul_icon} width={40} height={53} style={
                            {
                                bottom: `${-20 + (graphValues.data[graphValues.data.length - 1].price - graphValues.min)
                                /
                                (graphValues.max - graphValues.min) * graphHeight
                                }px`,
                                right: `15px`}
                        } alt={"JULDTP"} />
                    </div>
                </section>
            </header>
        </div>
    );
}

export default App;
