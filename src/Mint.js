import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

function Mint() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(
    `Click on mint to Buy your NFT Token.`
  );
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 4,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Pending`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(`successful`);
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <div className="px-8 md:px-40  w-full h-[100vh] py-10 mint__page">
      <div
        className="w-full"
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/mint.png" : null}
      >
        <div className="py-28 mx-auto w-full">
          <div className="flex bg-gray h-full py-10 mint__box rounded-md shadow-lg">
            <div className="flex justify-center items-center w-full  px-6 py-6 md:px-10 md:py-8 md:space-x-10">
              <div className="">
                {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                  <></>
                ) : (
                  <>
                    {blockchain.account === "" ||
                    blockchain.smartContract === null ? (
                      <div className="flex flex-col items-center justify-center w-full">
                        <h3 className="text-white text-center font-primary text-sm md:text-xl md:tracking-wider">
                          Connect to the {CONFIG.NETWORK.NAME} Network
                        </h3>

                        <button
                          className="bg-purple bg-white text-black font-bold px-10 py-4 rounded-md font-primary tracking-wider mt-16"
                          onClick={(e) => {
                            e.preventDefault();
                            dispatch(connect());
                            getData();
                          }}
                        >
                          CONNECT
                        </button>
                        {blockchain.errorMsg !== "" ? (
                          <>
                            <h2 class="text-center text-white mt-5 font-semibold font-Opensans">
                              {blockchain.errorMsg}
                            </h2>
                          </>
                        ) : null}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full space-y-4 md:space-y-8 ">
                        <h2 className="text-white font-primary text-base md:text-2xl">
                          {feedback}
                        </h2>

                        <div className="flex items-center space-x-5 md:space-x-10">
                          <button
                            className="bg-white font-bold text-black w-20 md:w-32 h-16 text-xl rounded-lg"
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              claimNFTs();
                              getData();
                            }}
                          >
                            {claimingNft ? "Pending" : "Mint"}
                          </button>
                          <button
                            className="bg-white text-black  w-16 h-16  font-semibold text-2xl rounded-lg"
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              decrementMintAmount();
                            }}
                          >
                            -
                          </button>

                          <h2 className="text-white md:text-xl font-semibold text-2xl">
                            {mintAmount}
                          </h2>

                          <button
                            className="bg-white text-black h-16 w-16  font-semibold text-2xl rounded-lg"
                            disabled={claimingNft ? 1 : 0}
                            onClick={(e) => {
                              e.preventDefault();
                              incrementMintAmount();
                            }}
                          >
                            +
                          </button>
                        </div>

                        <div className="flex justify-center">
                          <div class="flex items-center font-primary text-white tracking-wider md:font-semibold md:mt-6 md:space-x-20 md:text-xl">
                            <span>
                              Only {CONFIG.MAX_SUPPLY - data.totalSupply} Left
                            </span>
                            <span> Max 20</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mint;
