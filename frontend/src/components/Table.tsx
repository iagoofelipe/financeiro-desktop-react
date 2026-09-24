import React, { useEffect, useState, type ReactNode } from 'react';
import '../styles/components/Table.css'

interface TableProps {
  columns: string[];
  values: ReactNode[][];
  hiddenIndexColumns?: number[];
  selectable?: boolean;
  indexRowSelected?: number;
  onRowSelected?: (index?:number) => void;
}

export default function Table({ columns, values, hiddenIndexColumns, selectable, indexRowSelected, onRowSelected }:TableProps) {
  // const [indexRowSelected, setIndexRowSelected] = useState<number>();

  // useEffect(() => {
  //   indexRowSelected != undefined && onRowSelected && onRowSelected();
  //   setIndexRowSelected(undefined);
  // }, [values]);

  const handleRowClicked = (e:React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
    if (!selectable)
      return;

    const rowIndex = e.currentTarget.ariaRowIndex? Number(e.currentTarget.ariaRowIndex) : undefined;
    // setIndexRowSelected(rowIndex);
    onRowSelected && onRowSelected(rowIndex);
  };

  return (
    <table className={`table ${selectable && 'table-selectable'}`}>

      <thead>
        <tr>
          {
            columns.map((col, index) => {
              return <th key={col} scope="col" hidden={hiddenIndexColumns && hiddenIndexColumns.includes(index)}>{col}</th>;
            })
          }
        </tr>
      </thead>
      <tbody>
        {
          values.map((row, row_index) => {
            return <tr key={row_index} aria-rowindex={row_index} onClick={handleRowClicked} className={(indexRowSelected === row_index)? 'selected' : ''}>
              {row.map((col, col_index) => {
                return <td
                    key={`${row_index}-${col_index}`}
                    aria-rowindex={row_index}
                    aria-colindex={col_index}
                    hidden={hiddenIndexColumns && hiddenIndexColumns.includes(col_index)}
                  >{col}</td>;
              })}
            </tr>;
          })
        }
      </tbody>

    </table>
  )
}