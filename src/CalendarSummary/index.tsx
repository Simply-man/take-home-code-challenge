import React, {useEffect, useState} from 'react';
import { CalendarEvent, getCalendarEvents } from '../api-client';
import { withStyles, Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

// Material UI components
const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
    },
  }),
)(TableCell);

// Material UI components
const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
      },
    },
  }),
)(TableRow);

// Material UI components
const useStyles = makeStyles({
  table: {
    minWidth: 700,
  },
});

// Main component
const CalendarSummary: React.FunctionComponent = () => {
  const classes = useStyles();
  const [calendarData, setCalendarData] = useState([] as any)
  const [totalLongestEvent, setTotalLogestEvent] = useState({} as any)
  const [error, setError] = useState(null)
  const [loading, isLoading] = useState(true as boolean)

  useEffect(() => {
    const today = new Date();
    const stateForClearCalendarData: { day: Date; result: CalendarEvent[]; }[] = [];

    const fetchCalendarEvents = async (today: Date) => {
      for(let i = 0; i < 7; i++) {
        const nextDay = new Date(new Date(today).setDate(today.getDate() + i));
        const result = await getCalendarEvents(nextDay);
        stateForClearCalendarData.push({
          day: nextDay,
          result
        })
      }
    }
    
    fetchCalendarEvents(today)
      .then(() => {
        const cleannerObjectForCalendarData: {uuid: String, day: String; durationInMinutesSum: Number, numberOfEvents: Number, longestEvent: String | undefined}[] = []
        const lognestEvents: { event: String  | undefined; maxDurationInMinutes: number; }[] = [];

        stateForClearCalendarData.forEach((item, index) =>{
          const uuid = item.result[index].uuid;
          const day = item.day.toLocaleString("pl-PL", {year: 'numeric', month: 'numeric', day: 'numeric' });
          const numberOfEvents = item.result.length;
          const durationInMinutesSum = item.result.reduce((acc, value) => acc + value.durationInMinutes , 0);
          const maxDurationInMinutes = item.result.reduce((acc, value) => Math.max(acc, value.durationInMinutes) , 0);
          const longestEvent = item.result.sort((a,b) => b.durationInMinutes - a.durationInMinutes)[0];
          
          lognestEvents.push({event: longestEvent?.title, maxDurationInMinutes});
          cleannerObjectForCalendarData.push({uuid, day, durationInMinutesSum, numberOfEvents, longestEvent: longestEvent?.title});
        })

        const findLongestEvents = lognestEvents.sort((a: any, b: any) => b.maxDurationInMinutes - a.maxDurationInMinutes)[0];

        if(Object.keys(findLongestEvents).length > 0) setTotalLogestEvent(findLongestEvents);

        if(cleannerObjectForCalendarData.length > 0) {
          setCalendarData(cleannerObjectForCalendarData)
          isLoading(false)
        };
      })
      .catch(error => setError(error))

  }, [])

  return (
    <div>
      <h2>Calendar summary</h2>
      {error ? <div> Some error occured!</div> : loading && <div> Fetching data... Please wait...</div>}
      {!loading &&
      <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Date</StyledTableCell>
            <StyledTableCell align="right">Number of events</StyledTableCell>
            <StyledTableCell align="right">Total duration [min]</StyledTableCell>
            <StyledTableCell align="right">Longest event</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {calendarData.map((day: any) => (
            <StyledTableRow key={day.uuid}>
              <StyledTableCell component="th" scope="row">
                {day.day}
              </StyledTableCell>
              <StyledTableCell align="right">{day.numberOfEvents}</StyledTableCell>
              <StyledTableCell align="right">{day.durationInMinutesSum}</StyledTableCell>
              <StyledTableCell align="right">{day.longestEvent}</StyledTableCell>
            </StyledTableRow>
          ))}
          <StyledTableRow>
              <StyledTableCell component="th" scope="row">
                <b>Total</b>
              </StyledTableCell>
              <StyledTableCell align="right"><b>{calendarData.reduce((acc: Number, value: any) => acc + value.numberOfEvents , 0)}</b></StyledTableCell>
              <StyledTableCell align="right"><b>{calendarData.reduce((acc: Number, value: any) => acc + value.durationInMinutesSum , 0)}</b></StyledTableCell>
              <StyledTableCell align="right"><b>{totalLongestEvent.event}</b></StyledTableCell>
            </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
}
    </div>
  );
};

export default CalendarSummary