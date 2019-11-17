import React from 'react';
import './App.css';
import { Container, Row, Col } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [mode, setMode] = React.useState('single');
  const [sign, setSign] = React.useState('0');
  const [wholeNumber, setWholeNumber] = React.useState('');
  const [fractionNumber, setFractionNumber] = React.useState('');
  const [exponent, setExponent] = React.useState('');
  const [binaryOutput, setBinaryOutput] = React.useState('');
  const [hexOutput, setHexOutput] = React.useState('');
  const [hasCompleteInput, setHasCompleteInput] = React.useState(false);
  const [maxExponent, setMaxExponent] = React.useState(127);

  React.useEffect(() => {
    setHasCompleteInput(!!wholeNumber && !!fractionNumber && !!exponent)
  }, [wholeNumber, fractionNumber, exponent])

  React.useEffect(() => {
    setWholeNumber('');
    setFractionNumber('');
    setExponent('');
    setBinaryOutput('');
    setHexOutput('');
    setMaxExponent(mode === 'single' ? 127 : 1023)
  }, [mode])

  function convertInput() {
    const { fraction, exp } = normalize();

    const bias = mode === 'single' ? 127 : 1023;
    const exponentWithBias = exp + bias;

    const sizeOfExponent = mode === 'single' ? 8 : 11;
    let exponentBinaryString = exponentWithBias.toString(2);
    const sizeOfSignificand = mode === 'single' ? 23 : 52;
    const significandPlaceholder = [...Array(sizeOfSignificand).fill('0')];

    fraction.forEach((s, i) => {
      significandPlaceholder[i] = s;
    });

    if (exponentBinaryString.length < sizeOfExponent) {
      let prependZero = '';
      for (let i=0; i<sizeOfExponent-exponentBinaryString.length; i++) {
        prependZero += '0'
      }
      exponentBinaryString = prependZero + exponentBinaryString;
    }

    const hasNoSignificand = fraction.every(d => d === '0');
    const maxExponent = mode === 'single' ? 254 : 2046;

    if (sign === '0' && exponentWithBias < 1 && hasNoSignificand) {
      setBinaryOutput('+0 (Positive Zero)');
      setHexOutput('+0 (Positive Zero)');
    } else if (sign === '1' && exponentWithBias < 1 && hasNoSignificand) {
      setBinaryOutput('-0 (Negative Zero)');
      setHexOutput('-0 (Negative Zero)');
    } else if (exponentWithBias < 1 && !hasNoSignificand) {
      setBinaryOutput('Denormalized');
      setHexOutput('Denormalized');
    } else if (sign === '0' && exponentWithBias > maxExponent && hasNoSignificand) {
      setBinaryOutput('+ Infinity');
      setHexOutput('+ Infinity');
    } else if (sign === '1' && exponentWithBias > maxExponent && hasNoSignificand) {
      setBinaryOutput('- Infinity');
      setHexOutput('- Infinity');
    } else if (exponentWithBias > maxExponent && !hasNoSignificand) {
      setBinaryOutput('NaN');
      setHexOutput('NaN');
    } else {
      const binaryStringOutput = `${sign} ${exponentBinaryString} ${significandPlaceholder.join('')}`; 
      const hexStringOutput = parseInt(`${sign}${exponentBinaryString}${significandPlaceholder.join('')}`, 2)
                                .toString(16).toUpperCase();
      setBinaryOutput(binaryStringOutput);
      setHexOutput('0x' + hexStringOutput);
    }
  }

  function normalize() {
    const wholeNumberArr = wholeNumber.split('');
    const fractionNumberArr = fractionNumber.split('');
    
    if (wholeNumberArr.length === 1) {
      if (wholeNumberArr[0] === '1') {
        return {
          fraction: fractionNumber.split(''),
          exp: Number(exponent)
        }
      }

      const index = fractionNumberArr.findIndex(c => c === '1');
    
      return {
        fraction: fractionNumberArr.slice(index+1),
        exp: Number(exponent) - index - 1,
      }
    }
    
    const [first, ...rest] = wholeNumberArr;
    const newFraction = rest.concat(fractionNumberArr);
      return {
      fraction: newFraction,
      exp: Number(exponent) + rest.length,
    }   
  }

  return ( 
    <Container>
      <br />
      <Row displayname="title">
        <Col>
          <h1>Binary Floating Point Converter</h1>
        </Col>
      </Row>
      <hr />
      <br />
      <Row>
        <Col md={1}>
          <label>Mode: </label>
        </Col>
        <Col>
          <select value={mode} onChange={e => setMode(e.target.value)}>
            <option value="single">Single Precision</option>
            <option value="double">Double Precision</option>
          </select>
        </Col>
      </Row>
      <Row>
        <Col md={1}>
          <select value={sign} onChange={e => setSign(e.target.value)}>
            <option value={0}>+</option>
            <option value={1}>-</option>
          </select>
        </Col>
        <Col md={5}>
          <input 
            name="wholeNumber"
            type="number"
            placeholder="1"
            value={wholeNumber}
            onChange={e => setWholeNumber(e.target.value)}
          />
          <span>{` . `}</span>
          <input 
            name="fractionNumber"
            type="number"
            placeholder="101010"
            value={fractionNumber}
            onChange={e => setFractionNumber(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <span>2^</span>
          <input
            name="exponent"
            type="number"
            placeholder="Enter exponent"
            max={maxExponent}
            value={exponent}
            onChange={e => setExponent(e.target.value)}
          />
        </Col>
        <Col>
          <button onClick={() => convertInput()} disabled={!hasCompleteInput}>Convert</button>
        </Col>
      </Row>
      <br />
      <hr />
      <Row>
        <Col>
          <span>Output:</span>
        </Col>
      </Row>
      <br />
      <Row>
        <Col md={1}>
          <h4>Binary:</h4>
        </Col>
        <Col md={11}>
          <h3>{binaryOutput}</h3>
        </Col>
      </Row>
      <Row>
        <Col md={1}>
          <h4>Hex:</h4>
        </Col>
        <Col md={11}>
          <h3>{hexOutput}</h3>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
