import "./i18n";
import { useEffect, useState } from "react";
import { Grommet, Box, Text, Button, TextArea, Layer, Spinner } from "grommet";
import { Archive, Users, Activity } from "react-feather";
import config from "./config";
import Api from "./Api";
import domtoimage from "dom-to-image";
import { saveAs } from "file-saver";
import Theme from "./Theme";
import repository from "./repository";
const { getUserData, getPreferenceData } = repository;
import { useTranslation } from "react-i18next";
import { langNameMap } from "./language";

const { uploadArchivedMedia, invokeNetwork } = Api;

const CTAButton = ({ icon, label, onClick }) => {
  return (
    <Box
      round
      pad={{
        top: "xsmall",
        bottom: "xsmall",
        left: "medium",
        right: "medium",
      }}
      hoverIndicator={"neutral-1"}
      focusIndicator={false}
      border={{ color: "neutral-1" }}
      onClick={onClick}
      direction={"row"}
      gap={"medium"}
      align="center"
    >
      {icon}
      <Text size={"medium"} color={"brand"}>
        {label}
      </Text>
    </Box>
  );
};

export function InlineButtons({ node }) {
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [progress, showProgress] = useState(false);
  const [notification, setNotification] = useState(undefined);

  const [userLS, setUserLS] = useState(undefined);
  const [preferenceLS, setPreferenceLS] = useState(undefined);

  const { t, i18n } = useTranslation();

  function showNotification(notification) {
    setNotification(notification);
    setTimeout(() => {
      setNotification(undefined);
    }, 2000);
  }

  async function updateData() {
    const userData = await getUserData();
    const preferenceData = await getPreferenceData();
    setUserLS(userData);
    setPreferenceLS(preferenceData);
  }

  useEffect(async () => {
    updateData();
  }, []);

  useEffect(() => {
    console.log("preference changed", preferenceLS);
    if (preferenceLS != undefined) {
      const { language } = preferenceLS;
      if (language != undefined) {
        i18n.changeLanguage(langNameMap[language]);
      }
    }
  }, [preferenceLS]);

  useEffect(async () => {
    chrome.runtime.onMessage.addListener(async function (
      message,
      sender,
      sendResponse
    ) {
      switch (message.type) {
        case "updateData":
          await updateData();
          sendResponse("date updated");
          break;
      }
    });
  });

  async function clickArchive() {
    console.log("clicked archive");
    await updateData();
    try {
      showProgress(true);
      let mainNode = document.getElementsByTagName("main")[0];
      let tweetCount = document.getElementsByTagName("article").length;

      domtoimage
        .toBlob(mainNode)
        .then(async function (blob) {
          if (preferenceLS.storeLocally) {
            saveAs(
              blob,
              `ogbv_plugin_tweet_${new Date()
                .toTimeString()
                .split(" ")
                .join("_")}.png`
            );
          }
          var formData = new FormData();
          formData.append("screenshot", blob);
          formData.append("url", location.href);
          // await uploadArchivedMedia(accessToken, formData);
          await uploadArchivedMedia(userLS.accessToken, formData);
          showProgress(false);
        })
        .catch((err) => {
          showProgress(false);
          showNotification({ message: "Error in archiving post." });
        });
    } catch (err) {
      showProgress(false);
      showNotification({ message: "Error in archiving post." });
    }
  }
  function clickInvokeNetwork() {
    console.log("clicked invoke network");

    setShowPopup(true);
  }

  async function clickSend() {
    await updateData();
    try {
      await invokeNetwork(userLS.accessToken, message, location.href);
    } catch {
      console.log("Error invoking network");
    } finally {
      setShowPopup(false);
    }
  }

  async function clickTest() {
    console.log("test clicked");
    await updateData();
    console.log({ userLS, preferenceLS });
    // console.log(chrome);
    // chrome.storage.local.set({ "ogbv-data": "Your data" }, function (result) {
    //   console.log(" Data saved ");
    // });
    // console.log("getting value in Content Script");
    // chrome.storage.local.get(["ogbv-data"], function (result) {
    //   console.log("Value currently is " + result.key);
    //   console.log(result);
    // });
  }

  return (
    <Grommet theme={Theme}>
      <Box>
        <Box
          direction={"column"}
          gap={"small"}
          align="start"
          margin={{ bottom: "small" }}
          pad={"xsmall"}
        >
          <CTAButton
            icon={<Archive size={24} color="#ff006e" />}
            label={t("archive")}
            onClick={clickArchive}
          />

          <CTAButton
            icon={<Users size={24} color="#ff006e" />}
            label={t("ask_friends_for_help")}
            onClick={clickInvokeNetwork}
          />

          {/* <CTAButton
            icon={<Activity size={24} color="#ff006e" />}
            label={"Test"}
            onClick={clickTest}
          /> */}

          {showPopup ? (
            <Layer
              onEsc={() => setShowPopup(false)}
              onClickOutside={() => setShowPopup(false)}
            >
              <Box width={"medium"} gap={"medium"} margin={"large"}>
                <TextArea
                  placeholder={"hey can you help me report this post?"}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                ></TextArea>
                <Box direction={"row"} gap={"small"}>
                  <Button label="Cancel" onClick={() => setShowPopup(false)} />
                  <Button
                    label="Send"
                    onClick={() => {
                      clickSend();
                    }}
                    primary
                  />
                </Box>
              </Box>
            </Layer>
          ) : null}
        </Box>
        <Box direction="row">
          {progress ? <Spinner /> : null}
          {notification ? (
            <Text color={"brand"}>{notification.message}</Text>
          ) : null}
        </Box>
      </Box>
    </Grommet>
  );
}
