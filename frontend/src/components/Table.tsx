import type { ReactNode } from 'react';
import '../styles/components/Table.css'

interface TableProps {
  columns: string[];
  hiddenColumns?: string[];
  values: ReactNode[][];
}

export default function Table({ columns, values, hiddenColumns }:TableProps) {
  let row_index = 0, item_key = 0;
  // let cols = [];

  // for (let row=0; row<columns.length; row++) {
  //   cols.push(
  //     <
  //   );
  // }

  let values_formatted = [];

  for (let row=0; row<values.length; row++) {
    let cols = [];
    for (let col=0; col<columns.length; col++) {
      cols.push(col < values[row].length && values[row][col]);
    }
    values_formatted.push(cols);
  }

  return (
    <table className="table">

      <thead>
        <tr>
          {
            columns.map((col) => {
              return <th key={col} scope="col" hidden={hiddenColumns && hiddenColumns.includes(col)}>{col}</th>;
            })
          }
        </tr>
      </thead>
      <tbody>
        {
          values_formatted.map((row) => {
            return <tr key={++row_index}>
              {row.map((col) => {
                return <td key={++item_key}>{col}</td>;
              })}
            </tr>;
          })
        }
      </tbody>

    </table>
  )
}