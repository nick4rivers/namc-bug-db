import React from 'react'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import { makeStyles } from '@material-ui/core/styles'
import style from './App.style'

const useStyles = makeStyles(style)

interface Props {
    history: any
}

const App: React.FC<Props> = ({ history }: Props) => {
    const classes = useStyles()

    return (
        <Container className={classes.root}>
            <Typography>This is an app</Typography>
        </Container>
    )
}

export default App
