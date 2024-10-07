import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchBets, getUSDPrice } from '../contracts/Getters';
import TabsComponent from '../components/TabsComponent';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { Box, Button } from '@mui/material';
import { Bet } from '../contracts/ChildContract';
import { BetDetails, BetInfo } from '../contracts/wrappers';
import { useTonAddress, useTonConnectUI } from '@tonconnect/ui-react';
import { betAmountContainer, loader, politImage } from '../components/ComponentFunctions';
import { calculateEstimateForList, getTokenName, isBetActive, isWinner } from '../contracts/CommonFunctions';
import { fromNano } from 'ton-core';
import MuiDropdown from '../components/MuiDropdown';
import { ImageUrls } from '../ImageUrls';


const ListPage: React.FC = () => {

  //fetching data start 
  //load list of contracts
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<Bet[]>([]);
  const userFriendlyAddress = useTonAddress();
  const [tonConnectUI] = useTonConnectUI();
  const [showRetry, setShowRetry] = useState<boolean>(false);
  const [tokenType, setTokenType] = useState<number>(1);

  const loadContractsData = async (type: number, tokenType: number) => {
    setLoading(true);
    try {
      const result = await fetchBets(type, tokenType, userFriendlyAddress);
      setData(result);
      setShowRetry(false)
    } catch (error) {
      console.error("Error in loadContractsData:", error);
      setShowRetry(true)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContractsData(activeTab, tokenType);
  }, []);
  //fetching data end 

  const navigate = useNavigate();
  const handleClick = (item: Bet) => {
    if (isBetActive(item.betInfo)) {
      navigate('/bet/'.concat(item.address), { state: serializeBet(item) });
    }
  };
  const [activeTab, setActiveTab] = useState(0);
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue == 1 && !tonConnectUI.connected) {
      tonConnectUI.openModal()
      return;
    }

    if (loading) {
      setActiveTab(activeTab)
      return;
    }
    if (activeTab != newValue) {
      setActiveTab(newValue);
      loadContractsData(newValue, tokenType)
    }
  };

  const handleRetry = () => {
    loadContractsData(activeTab, tokenType)
  }

  const handleTokenType = (newTokenType: number) => {
    setTokenType(newTokenType)
    loadContractsData(activeTab, newTokenType)
  }

  return (
    <div className='listpage'>
      <TabsComponent activeTab={activeTab} handleTabChange={handleTabChange} />

      {/* Render loader when loading is true */}
      {loading ? (
        loader()
      ) : (
        <>
          {showRetry ? (
            retryButton(handleRetry)
          ) : (
            <Box>


              {(() => {
                switch (activeTab) {
                  case 0:
                    return <>
                      <Box sx={{ mt: 3, ml: '16px', mr: '16px' }}>
                        <MuiDropdown options={options} onSelectionChange={handleTokenType} selectedValue={tokenType} />
                      </Box>
                      {commonBetsList(data, handleClick)}
                    </>
                  case 1:
                    return userBetsList(data, handleClick);
                  default:
                    return <div>No content available</div>; // Fallback for unexpected tab values
                }
              })()}
            </Box>
          )}
        </>
      )}
    </div>

  );
}

function commonBetsList(data: Bet[], onItemClick: (item: Bet) => void) {
  return (
    <List sx={{ width: '100%' }}>
      {data.map((item, i) => (
        <div key={i}>
          <ListItem alignItems="center" onClick={() => onItemClick(item)}>
            {commonBetItem(item.betInfo)}
          </ListItem>
        </div>
      ))}
    </List>
  )
}


function userBetsList(data: Bet[], onItemClick: (item: Bet) => void) {
  return (
    <List sx={{ width: '100%' }}>
      {data.map((item, i) => (
        item.betDetails != null && (<div key={i}>
          <ListItem alignItems="center" onClick={() => onItemClick(item)}>
            {userBetItem(item.betInfo, item.betDetails)}
          </ListItem>
        </div>)
      ))}
    </List>
  )
}

function commonBetItem(betInfo: BetInfo) {
  return (
    <Box
      sx={{
        backgroundColor: '#1d2b39',
        color: 'white',
        width: '100%',
        textAlign: 'center',
        borderRadius: '10px',
        padding: '16px',
        boxShadow: 1,
        border: `1px solid #2c3f50`,
      }}
    >
      {betHeader(betInfo)}


      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ml: 1, mr: 1 }}>
        {betAmountContainer(1, betInfo)}
        <Box sx={{ mt: 1 }} />
        {betAmountContainer(2, betInfo)}
      </Box>
    </Box>
  );
}

function userBetItem(betInfo: BetInfo, betDetails: BetDetails) {
  return (
    <Box
      sx={{
        backgroundColor: '#1d2b39',
        color: 'white',
        width: '100%',
        textAlign: 'center',
        borderRadius: '10px',
        padding: '16px',
        boxShadow: 1,
        border: `1px solid #2c3f50`,
      }}
    >
      {betHeader(betInfo)}

      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', ml: 1, mr: 1 }}>
        {betAmountContainer(
          1,
          betInfo,
          betDetails
        )}
        <Box sx={{ mt: 1 }} />
        {betAmountContainer(
          2,
          betInfo,
          betDetails
        )}
      </Box>
      {isBetActive(betInfo) ? (
        <div>
          {amountHolder(betInfo, betDetails, ("Размер ставки в "+ getTokenName(betInfo.token_type) + ":"), '#2c9cdb', false)}
          {amountHolder(betInfo, betDetails,  ("Возможный выигрыш в "+ getTokenName(betInfo.token_type) + ":"), '#25af60', true)}
        </div>
      ) : (
        <Typography
          sx={{
            flex: 1,
            fontWeight: 'normal',
            fontSize: 'md',
            color: 'white',
            wordWrap: 'break-word',
            whiteSpace: 'normal',
            pr: 2,
            mt: 1,
            textAlign: 'left',
          }}
        >
          {isWinner(betInfo, betDetails) ? "Победа!" : "Неудача"}
        </Typography>)}
    </Box>
  );
}

function betHeader(betInfo: BetInfo) {
  function getTokenImage(token_type: string): string {
    switch (token_type) {
      case '1':
        return ImageUrls.tonLogoUrl
      case '2':
        return ImageUrls.hmstrLogoUrl
      case '3':
        return ImageUrls.usdtLogoUrl
      case '4':
        return ImageUrls.dogsLogoUrl
      case '5':
        return ImageUrls.notcoinLogoUrl

      default:
        return ImageUrls.politMarketLogo
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '12px', position: 'relative' }}>
      {politImage(betInfo.image)}
      <Box
        component="img"
        src={getTokenImage(betInfo.token_type)}
        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
          (e.target as HTMLImageElement).src = ImageUrls.tonLogoUrl
        }}
        alt="Something went wrong"
        sx={{
          width: 24,
          height: 24,
          objectFit: 'cover',
          position: 'absolute', // Position the Box absolutely
          left: 42

        }}
      />
      <Typography variant="body1" sx={{
        color: 'white',
        flexGrow: 1,
        textAlign: 'left',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}>
        {betInfo.title}
      </Typography>
    </div>
  )
}


function amountHolder(betInfo: BetInfo, betDetails: BetDetails, title: string, color: string, shouldCalculate: boolean) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        mt: 1,
      }}
    >
      <Typography
        variant="body1"
        sx={{ color: '#848d91', mr: 1, }}
      >
        {title}
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: color, }}
      >
        {shouldCalculate ? calculateEstimateForList(betInfo, Number(betDetails.outcome).toString(), Number(fromNano(betDetails.amount))) : Number(fromNano(betDetails.amount)).toString()}
      </Typography>
    </Box>
  )
}

function serializeBet(bet: Bet): string {
  return JSON.stringify(bet, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  );
}

function retryButton(handleRetry: () => void) {
  return (
    <Box sx={{
      width: '100%',
      height: '100px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Button
        sx={{
          background: '#2c9cdb',
          color: 'white'
        }}
        onClick={() => handleRetry()}>
        Перезагрузить
      </Button>
    </Box >
  )
}

const options = [
  { label: 'TON', value: 1 },
  { label: 'Hamster combat', value: 2 },
  { label: 'USDT', value: 3 },
  { label: 'Dogs', value: 4 },
  { label: 'Notcoin ', value: 5 },
];

export default ListPage;