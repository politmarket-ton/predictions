import { TonConnectButton, useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import BetInput from '../components/BetInput';
import { Bet } from '../contracts/ChildContract';
import { Box, Button, IconButton as MuiIconButton, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormLabel from '@mui/joy/FormLabel';
import Radio from '@mui/joy/Radio';
import RadioGroup from '@mui/joy/RadioGroup';
import Sheet from '@mui/joy/Sheet';
import JoyBox from '@mui/joy/Box';
import { BetInfo } from '../contracts/wrappers';
import { createTransactionForStringMessage, createTransactionForToken } from '../contracts/Senders';
import { fetchContractByAddress, getUSDPrice } from '../contracts/Getters';
import { fromNano } from 'ton-core';
import { betAmountContainer, politImage } from '../components/ComponentFunctions';
import { getPercent } from '../contracts/CommonFunctions';

interface LocationState {
    state: string;
}

const BetPage: React.FC = () => {
    const { address } = useParams();
    const location = useLocation();
    const { state } = location as LocationState;
    const navigate = useNavigate();
    const [tonConnectUI] = useTonConnectUI();
    const [bet, setBet] = useState<Bet | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [betType, setBetType] = useState<string>('1');
    const [usdRate, setUsdRate] = useState<number>(1);
    const userFriendlyAddress = useTonAddress();

    const loadContractData = async () => {
        setLoading(true);
        try {
            if (address != null) {
                const result = await fetchContractByAddress(address);
                setBet(result);
            }

        } catch (error) {
            console.error("fetch contract data error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getUSDPrice().then(price => {
            if (price !== null) {
                setUsdRate(price)
            }
        });

        if (state !== null && state !== "") {
            setBet(deserializeBet(state))
        } else {
            loadContractData();
        }
    }, []);


    const handleBetTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value == bet?.betInfo.bet_a_name) {
            setBetType("1");
        } else if (value == bet?.betInfo.bet_b_name) {
            setBetType("2");
        }
    };

    const onSubmitPressed = async (amount: string) => {
        if (bet != null) {
            const transaction = bet.betInfo.token_type === '1' ? createTransactionForStringMessage(betType, amount, bet.address)
                : await createTransactionForToken(betType, amount, bet.address, userFriendlyAddress, bet.betInfo.token_type)


            if (transaction !== null) {
                tonConnectUI.sendTransaction(transaction)
            } else {
                console.error('Failed create transaction!')
            }
        }
    }

    return (
        <div>
            <div className='bet-header '>
                <MuiIconButton onClick={() => navigate('/list')} aria-label="go back">
                    <ArrowBackIcon sx={{ color: 'white' }} />
                </MuiIconButton>

                <TonConnectButton style={{ marginRight: 20 }} />
            </div>

            <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mr: 3, ml: 3 }}
            >
                {politImage(bet?.betInfo.image ?? "")}

                <Typography variant="h5" sx={{
                    textAlign: 'left',
                    flexGrow: 1,
                    color: 'white',
                    ml: 3
                }}>
                    {bet?.betInfo.title}
                </Typography>
            </Box>

            <Typography variant="body1" sx={{
                color: 'white',
                display: 'flex',
                justifyContent: 'start', ml: 3, mr: 3, mt: 1
            }}>
                {bet?.betInfo.source}
            </Typography>


            {Number(bet?.betInfo?.finishDate ?? 0) <= 0 &&
                <div>
                    <Box sx={{ display: 'flex', mt: 1 }}>
                        {IconlessRadio(bet?.betInfo, usdRate, handleBetTypeChange)}
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'start', mt: 1, ml: 3, mr: 3 }}>
                        <BetInput
                            onConfirm={onSubmitPressed}
                            bet={bet}
                            betType={betType}
                        />
                    </Box>
                </div>
            }

            {bet != null && Number(bet.betInfo.finishDate) > 0 &&
                <Box sx={{ ml: 3, mr: 3, mt: 1 }}>

                    <Typography variant="body1" sx={{
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'start', mb: 1
                    }}>
                        Result
                    </Typography>

                    {betAmountContainer(Number(bet.betInfo.winnerOption), bet.betInfo, bet.betDetails)}
                </Box>
            }

            <Box sx={{ display: 'flex', mt: 1, mr: 3, ml: 3, mb: 5, gap: 2 }}>
                {BetButtons("Поделиться", () => {
                    if (bet != null) {
                        handleShare("https://t.me/politmarket_bot/politMarket/?startapp=".concat(bet.address))
                    }
                })}
                {BetButtons("В канал", () => {
                    window.Telegram.WebApp.openTelegramLink('https://t.me/PolitMarketDaily')
                })}
            </Box>


        </div >
    );
}

function BetButtons(text: string, onChange: () => void) {
    return (
        <Button
            variant="outlined"
            color="primary"
            onClick={onChange}
            sx={{
                flexGrow: 1, // Make the button take up available space
                color: 'white',
                borderColor: '#2c9cdb', // Set the default border color
                borderRadius: 20, // Adjust the value to control the roundness
                padding: '8px 16px', // Adjust padding as needed
                marginTop: '8px',
                alignSelf: 'flex-start', // Align the Button to the top

                '&:hover': {
                    borderColor: '#2c9cdb', // Ensure the border color is consistent on hover
                    backgroundColor: 'rgba(44, 156, 219, 0.1)' // Optional: Light background color on hover
                },
                '&.Mui-focused': {
                    borderColor: '#2c9cdb', // Ensure the border color is consistent when focused
                    boxShadow: `0 0 0 2px rgba(44, 156, 219, 0.1)` // Optional: Shadow for focus state
                },
                '&:focus': {
                    outline: 'none', // Remove focus outline
                },
            }}
            fullWidth // Ensures the button takes up full width of the container
        >
            {text}
        </Button>
    )
}



function IconlessRadio(betInfo: BetInfo | undefined, usdRate: number, handleBetTypeChange: (event: React.ChangeEvent<HTMLInputElement>) => void) {
    if (betInfo === undefined) return;
    const radioInfo = [new RadioButtonInfo(betInfo.bet_a_name, betInfo.total_bet_a), new RadioButtonInfo(betInfo.bet_b_name, betInfo.total_bet_b)]
    return (
        <JoyBox sx={{ width: '100%', ml: 3, mr: 3 }}>
            <FormLabel
                id="bets"
                sx={{
                    mb: 1,
                    fontWeight: 'xl',
                    fontSize: 'md',
                    color: 'white'
                }}
            >
                Выбериту ставку
            </FormLabel>
            <RadioGroup
                aria-labelledby="bets"
                defaultValue={betInfo?.bet_a_name}
                size="lg"
                sx={{ gap: 1.5 }}
                onChange={handleBetTypeChange}
            >
                {radioInfo.map((value, index) => (
                    <Sheet
                        key={value.title}
                        sx={{
                            p: 1,
                            borderRadius: 'md',
                            backgroundColor: 'transparent',
                            border: '1px solid transparent',
                            boxShadow: 'none',
                            outlineColor: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%'
                        }}
                    >
                        <Radio
                            label={value.title}
                            overlay
                            disableIcon
                            value={value.title}
                            sx={{
                                flex: 1, // Make the radio take available space
                                wordWrap: 'break-word', // Ensure long text wraps
                                whiteSpace: 'normal',
                                pr: 2
                            }}
                            slotProps={{
                                label: ({ checked }) => ({
                                    sx: {
                                        fontWeight: checked ? 'bold' : 'normal', // Bolder font when selected
                                        fontSize: 'md',
                                        color: 'white',
                                        wordWrap: 'break-word', // Ensure long text wraps
                                        whiteSpace: 'normal', // Ensure normal white space handling
                                    },
                                }),
                                action: ({ checked }) => ({
                                    sx: {
                                        border: checked ? '1px solid #2c9cdb' : '1px solid white',
                                        '&:hover': {
                                            backgroundColor: 'transparent',
                                        },
                                    },
                                }),
                            }}
                        />


                        <Box
                            sx={{
                                backgroundColor: 'rgba(44, 156, 219, 0.4)',
                                color: 'white',
                                maxWidth: '30%', // Limit the maximum width to 30% of its container
                                textAlign: 'center',
                                borderRadius: '8px',
                                pt: '4px',
                                pb: '4px',
                                pr: '8px',
                                pl: '8px',
                                marginRight: '4px',
                                overflow: 'hidden', // Ensure no content overflows outside of the Box
                                display: 'flex', // Use flexbox for centering content
                                alignItems: 'center', // Center items vertically
                                justifyContent: 'center' // Center items horizontally
                            }}
                        >
                            <Typography
                                noWrap // Prevent text wrapping
                                sx={{
                                    overflow: 'hidden', // Hide any overflowed content
                                    textOverflow: 'ellipsis', // Show ellipsis when text overflows
                                    whiteSpace: 'nowrap', // Prevent text from wrapping
                                    fontSize: 'inherit', // Inherit font size from parent (optional)
                                    color: 'inherit' // Inherit color from parent (optional)
                                }}
                            >
                                {getPercent(index, betInfo).concat('%')}
                            </Typography>
                        </Box>

                    </Sheet>
                ))}
            </RadioGroup>
        </JoyBox>
    );
}


function deserializeBet(json: string): Bet {
    return JSON.parse(json, (key, value) =>
        typeof value === 'string' && /^\d+n$/.test(value) ? BigInt(value.slice(0, -1)) : value
    );
}

const handleShare = async (text: string) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Politmarket',
                text: 'Bet on any event!',
                url: text,
            });
            console.log('Content shared successfully');
        } catch (error) {
            console.error('Error sharing content:', error);
        }
    } else {
        console.warn('Web Share API is not supported in your browser');
    }
}

class RadioButtonInfo {
    title: string;
    coef: bigint;

    constructor(title: string, coef: bigint) {
        this.title = title;
        this.coef = coef;
    }
}


export default BetPage;
