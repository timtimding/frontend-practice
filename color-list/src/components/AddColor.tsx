import { useState, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';

const ADD_DATA = gql`
  mutation CreateColor($input: CreateColorInput!){
    createColor(input: $input)
  }
`;

export default function AddColor () {
  const NameRef = useRef<HTMLInputElement>(null);
  const IndexRef = useRef<HTMLInputElement>(null);
  const [colorName, setColorName] = useState("");
  const [colorIndex, setColorIndex] = useState("");
  const [createColor, {loading, error}] = useMutation(ADD_DATA);
  
  const handleAdd = async () => {
    if(!NameRef.current || !IndexRef.current)
      return;
    const color = NameRef.current.value;
    const codeStr = (IndexRef.current.value.split(','));
    let colorCode = codeStr.map((num:string) => parseInt(num));
    
    console.log(color, colorCode);
    try {
      const { data } = await createColor({
        variables: {
          input: {
            color: color,
            colorCode: colorCode,
          }
        },
      });
      console.log(data);
      setColorIndex("");
      setColorName("");
    } catch (error) {
      console.error('Mutation error:', error);
    }
    if(loading) return <p>Adding...</p>
    if(error) return <p>{`Error ${error}`}</p>
  };
  return (
    <div>
      <input placeholder="Color" 
        ref={NameRef}
        value={colorName}
        onChange={(e) => setColorName(e.target.value)}
        />
      <input placeholder="Color Code"
        ref={IndexRef}
        value={colorIndex}
        onChange={(e) => setColorIndex(e.target.value)}
        />
      <button onClick={handleAdd}>Enter</button>
    </div>
  );
}
