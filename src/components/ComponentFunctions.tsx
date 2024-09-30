import Typography from '@mui/material/Typography';
import { Box, CircularProgress } from '@mui/material';
import { fromNano } from 'ton-core';
import JoyBox from '@mui/joy/Box';
import { BetDetails, BetInfo } from '../contracts/wrappers';
import { isBetActive, isWinner } from '../contracts/CommonFunctions';
import { ImageUrls } from '../ImageUrls';

//Temporary descision for storing component functions, cause I don't know better practices
export function betAmountContainer(
    type: number,
    betInfo: BetInfo,
    betDetails: BetDetails | null = null
) {
    const borderColor = getBorderColor(betInfo, betDetails, type)
    const backgroundColor = getBackgroundColor(betInfo, betDetails, type)

    const title = type === 1 ? betInfo.bet_a_name : betInfo.bet_b_name

    return (
        <JoyBox
            sx={{
                p: 1,
                borderRadius: 'md',
                backgroundColor: backgroundColor,
                border: `1px solid ${borderColor}`,
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                boxShadow: 1,

            }}>

            <Typography
                sx={{
                    flex: 1,
                    fontWeight: 'normal',
                    fontSize: 'md',
                    color: 'white',
                    wordWrap: 'break-word',
                    whiteSpace: 'normal',
                    pr: 2,
                    textAlign: 'left',
                }}
            >
                {title}
            </Typography>
            {isBetActive(betInfo) && (<Box
                sx={{
                    backgroundColor: 'rgba(44, 156, 219, 0.4)',
                    color: 'white',
                    maxWidth: '30%',
                    textAlign: 'center',
                    borderRadius: '8px',
                    pt: '4px',
                    pb: '4px',
                    pr: '8px',
                    pl: '8px',
                    marginRight: '4px',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Typography
                    noWrap
                    sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        fontSize: 'inherit',
                        color: 'inherit',
                    }}
                >
                    {getPercent(type, betInfo).concat('%')}
                </Typography>
            </Box>)}

        </JoyBox>
    )
}

export function politImage(imageUrl: string, w: number = 64, h: number = 64) {
    return (
        <Box
            sx={{
                width: w,
                height: h,
                borderRadius: '50%',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
            }}
        >
            <Box
                component="img"
                src={imageUrl}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    (e.target as HTMLImageElement).src = ImageUrls.politMarketLogo
                }}
                alt="Something went wrong"
                sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />
        </Box>
    )
}

export function loader() {
    return (<div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        marginTop: '28px'
    }}>
        <CircularProgress sx={{ color: '#2c9cdb' }} />
    </div>)
}

function getPercent(type: number, betInfo: BetInfo): string {
    if (betInfo.total_bet_a == 0n && betInfo.total_bet_b == 0n) {
        return '50'
    }
    const amount = type == 1 ? betInfo.total_bet_a : betInfo.total_bet_b
    const sum = betInfo.total_bet_a + betInfo.total_bet_b
    return (amount / sum * 100n).toString()
}

function getBorderColor(betInfo: BetInfo, betDetails: BetDetails | null, type: number): string {
    if (betDetails === null) return "#2c3f50"
    return (isBetActive(betInfo) && Number(betDetails.outcome) === type) ? "#2c9cdb" : "#2c3f50"
}

function getBackgroundColor(betInfo: BetInfo, betDetails: BetDetails | null, type: number): string {
    if (betDetails === null || isBetActive(betInfo)) return "transparent"
    return (!isBetActive(betInfo) && isWinner(betInfo, betDetails) && type === Number(betInfo.winnerOption)) ? '#2c9cdb' : (
        (!isBetActive(betInfo) && !isWinner(betInfo, betDetails) && type === Number(betInfo.winnerOption)) ? 'rgba(230, 72, 1, 0.2)' : 'transparent'
    )
}


