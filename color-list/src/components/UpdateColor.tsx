import { useState, useRef } from 'react';
import { useMutation, gql } from '@apollo/client';

const EDIT_DATA = gql`
  mutation UpdateColor($input: UpdateColorInput!){
    updateColor(input: $input)
  }
`;

export default function EditColor (
  {colorName, updateColorIndex, setEditing}:
  {colorName: string, updateColorIndex: string,
    setEditing: (value: boolean) => void}) {
  const IndexRef = useRef<HTMLInputElement>(null);
  const [colorIndex, setColorIndex] = useState(updateColorIndex);
  const [updateColor, {loading, error}] = useMutation(EDIT_DATA);

  const handleAdd = async () => {
    if(!IndexRef.current)
      return;
    const codeStr = (IndexRef.current.value.split(','));
    let colorCode = codeStr.map((num:string) => parseInt(num));
    
    console.log(colorName, colorCode);
    try {
      const { data } = await updateColor({
        variables: {
          input: {
            color: colorName,
            colorCode: colorCode,
          }
        },
      });
      console.log(data);
    } catch (error) {
      console.error('Mutation error:', error);
    }
    setEditing(false);
    if(loading) return <p>Adding...</p>
    if(error) return <p>{`Error ${error}`}</p>
  };

  return (
    <div>
      <input placeholder="Color"
        value={colorName}
        readOnly/>
      <input placeholder="Color Code" 
        ref={IndexRef} value={colorIndex}
        onChange={(e) => setColorIndex(e.target.value)}
        />
      <button onClick={handleAdd}>Enter</button>
    </div>
  );
}
