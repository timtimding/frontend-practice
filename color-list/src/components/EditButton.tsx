// import { useQuery, useMutation, gql } from "@apollo/client"
import { colorData } from "../utils/types";
import Button from '@mui/material/Button';


type EditColorType = {
  color: colorData, 
  setUpdateColorIndex: (value: string) => void,
  setUpdateColorName: (value: string) => void,
  setEditing: (value: boolean) => void,
}

export default function EditButton({color, setUpdateColorIndex, setUpdateColorName, setEditing}:EditColorType) {
    const handleEdit = () => {
        const colorCodeToString = `${color.colorCode[0]},${color.colorCode[1]},${color.colorCode[2]}`;
        setUpdateColorName(color.color);
        setUpdateColorIndex(colorCodeToString);
        setEditing(true);
    }
    return (<Button onClick={handleEdit}>Edit</Button>)
}