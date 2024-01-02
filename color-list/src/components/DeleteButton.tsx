import React from 'react';
// import { useState } from 'react';
import Button from '@mui/material/Button';
import { useMutation, gql } from '@apollo/client';

const DELETE_DATA = gql`
  mutation($input: DeleteColorInput!){
    deleteColor(input: $input)
  }
`;

export default function DeleteButton ({color}:{color:string}) {
  const [deleteColor] = useMutation(DELETE_DATA);
  const handleDelete = async () => {
    try{
      const {data} = await deleteColor({
        variables: {
          input: {
            color: color
          }
        },
      });
      console.log(data);
    } catch(error) {
      console.error(error);
    }
  }
  return (
    <Button
      onClick={handleDelete}>
      delete
    </Button>
  )
}