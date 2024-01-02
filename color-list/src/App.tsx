import React from 'react';
import { useState, useRef } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import './App.css';
import DeleteButton from './components/DeleteButton';
import EditButton from './components/EditButton';
import { colorData, ColorList } from './utils/types';
import AddColor from './components/AddColor';
import UpdateColor from './components/UpdateColor';

const GET_DATA = gql`
  query{
    colors {
      color
      colorCode
    }
  }
`;

function App() {
  
  const [editing, setEditing] = useState(false);
  const [updateColorName, setUpdateColorName] = useState("");
  const [updateColorIndex, setUpdateColorIndex] = useState("");

  const GetColor = () => {
    const { loading, error, data } = useQuery<ColorList>(GET_DATA);
    
    if (loading) return <p>Loading...</p>;
    if (error) return <p>{`Error! ${error.message}`}</p>;
    if (!data) return <p>"No data available."</p>;
    return (
      <table>
        <tbody>
        {data.colors.map((item, index) => (
          <tr key={index}>
            <td>{item.color}</td>
            <td>{item.colorCode[0]}</td>
            <td>{item.colorCode[1]}</td>
            <td>{item.colorCode[2]}</td>
            <td>
              <DeleteButton color={item.color}/>
            </td>
            <td>
              <EditButton 
                color={item}
                setUpdateColorIndex={setUpdateColorIndex}
                setUpdateColorName={setUpdateColorName}
                setEditing={setEditing}
                />
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <GetColor />
        {editing?
         <UpdateColor 
          colorName={updateColorName}
          updateColorIndex={updateColorIndex}
          setEditing={setEditing}/>:
         <AddColor />}
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
