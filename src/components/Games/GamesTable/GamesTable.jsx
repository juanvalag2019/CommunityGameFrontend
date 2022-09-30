import { AgGridReact } from 'ag-grid-react';
import React, { useCallback, useRef, useState } from 'react';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.min.css';
import { useNavigate } from 'react-router-dom';
import './GamesTable.css';

function GamesTable(props) {
    const navigateTo = useNavigate();
    const pageSize = 10;
    const [games, setGames] = useState([]);
    const gridRef = useRef();

    const [columnDefs] = useState([
        { field: 'title', sortable: true, suppressMovable: true },
        { field: 'platform', sortable: true, suppressMovable: true },
        { field: 'updatedAt', sortable: true, suppressMovable: true }
    ]);

    const onGridReady = useCallback(({ api }) => {
        api.sizeColumnsToFit();
        const dataSource = {
            getRows: ({ startRow, endRow, successCallback, failCallback }) => {
                const numRequiredGames = endRow - startRow;
                const requestedPage = endRow / numRequiredGames;
                fetch('/games?' + new URLSearchParams({
                    limit: numRequiredGames,
                    page: requestedPage,
                }))
                    .then(result => result.json())
                    .then(
                        games => {
                            successCallback(games, null);
                        },
                        error => {
                            console.log(error);
                            failCallback();
                        }
                    );
            }
        };
        api.setDatasource(dataSource);
    }, []);

    const onRowSelection = useCallback(() => {
        const selectedGames = gridRef.current.api.getSelectedRows();
        const gameId = selectedGames[0].id;
        navigateTo(`/games/${gameId}`, { replace: true });
    }, []);

    return (
        <div className='ag-theme-alpine' style={{ height: '100%', width: '100%' }}>
            <AgGridReact
                ref={gridRef}
                rowData={games}
                columnDefs={columnDefs}
                paginationPageSize={pageSize}
                pagination={true}
                rowModelType={'infinite'}
                onGridReady={onGridReady}
                domLayout='autoHeight'
                rowSelection={'single'}
                onSelectionChanged={onRowSelection}
            >
            </AgGridReact>
        </div>
    );
}

export default GamesTable