import { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Button,
  Modal,
  ScrollView,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import { uploadPicture } from "./post.js";
import { ActivityIndicator } from "react-native";
import {
  Feather,
  FontAwesome6,
  AntDesign,
  MaterialIcons,
  Entypo,
} from "@expo/vector-icons";

export default function App() {
  const initialFoods = [
    { food: "Oranges", price: "0.50" },
    { food: "Apples", price: "0.30" },
    { food: "Bananas", price: "0.25" },
    { food: "Berries", price: "1.00" },
    { food: "Peaches", price: "0.75" },
  ];
  const calculateInitialTotal = () => {
    return initialFoods
      .reduce((total, item) => total + parseFloat(item.price), 0)
      .toFixed(2);
  };
  const [shoppingTotal, setShoppingTotal] = useState(calculateInitialTotal);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const cameraRef = useRef(null);
  const [pictureUri, setPictureUri] = useState(null);
  const [foodList, setFoodList] = useState(initialFoods);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    content: null,
    onConfirm: () => {},
  });

  const addToFoodList = (result, uri) => {
    const newItem = { ...result, imageUri: uri };
    const newFoodList = [...foodList, newItem];
    setFoodList(newFoodList);
    const additionalPrice = Number(result.price);
    const newTotal = parseFloat(shoppingTotal) + additionalPrice;
    setShoppingTotal(newTotal.toFixed(2));
  };

  const ConfirmationModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalConfig.visible}
      onRequestClose={() =>
        setModalConfig((prev) => ({ ...prev, visible: false }))
      }
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {modalConfig.content}
          <View style={styles.buttonContainer}>
            <MaterialIcons
              name="cancel"
              size={60}
              color="#f77070"
              onPress={() =>
                setModalConfig((prev) => ({ ...prev, visible: false }))
              }
            />
            <Entypo
              name="circle-with-plus"
              size={60}
              color="#8dc88d"
              onPress={() => {
                modalConfig.onConfirm();
                setModalConfig((prev) => ({ ...prev, visible: false }));
              }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );

  const showDeleteConfirmation = (index) => {
    setModalConfig({
      visible: true,
      content: (
        <Text style={styles.modalText}>
          Are you sure you want to delete {foodList[index].food}?
        </Text>
      ),
      onConfirm: () => deleteFoodItem(index),
    });
  };

  const deleteFoodItem = (index) => {
    const newFoodList = [...foodList];
    const itemToRemove = foodList[index];
    newFoodList.splice(index, 1);
    setFoodList(newFoodList);

    const updatedTotal = shoppingTotal - parseFloat(itemToRemove.price);
    setShoppingTotal(updatedTotal.toFixed(2));
  };

  const handleReset = () => {
    setShoppingTotal(0.0);
    setFoodList([]);
  };

  const showResetConfirmation = () => {
    setModalConfig({
      visible: true,
      content: (
        <Text style={styles.modalText}>
          Are you sure you want to delete the list?
        </Text>
      ),
      onConfirm: () => handleReset(),
    });
  };

  const toggleCameraType = () => {
    setCameraType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        console.log("photo", photo);
        setShowCamera(false);
        setPictureUri(photo.uri);

        const result = await uploadPicture(photo.uri);
        console.log("Analysis Result:", result);
        if (result.food === "unknown" || result.price === "unknown") {
          return;
        }
        setAnalysisResult(result);
        showAnalysisResult(result, photo.uri);
      } catch (error) {
        console.error("Error taking or uploading picture:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const showAnalysisResult = (result, uri) => {
    setModalConfig({
      visible: true,
      content: (
        <>
          <Text style={styles.modalText}>
            {result.food} average price is ${result.price}
          </Text>
          <Image source={{ uri: uri }} style={styles.previewImage} />
        </>
      ),
      onConfirm: () => addToFoodList(result, uri),
    });
  };

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>
            We need your permission to show the camera
          </Text>
          <Button onPress={requestPermission} title="Grant Permission" />
        </View>
      );
    }

    return (
      <Camera style={styles.camera} type={cameraType} ref={cameraRef}>
        <View style={styles.cameraIcons}>
          <TouchableOpacity onPress={() => setShowCamera(false)}>
            <AntDesign name="close" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.pictureButton}
            onPress={takePicture}
          ></TouchableOpacity>
          <TouchableOpacity onPress={toggleCameraType}>
            <FontAwesome6 name="arrows-rotate" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* <Text style={styles.cartApp}>CartApp 🛒</Text> */}
      {/* <Text style={styles.total}>Total: ${shoppingTotal}</Text> */}
      {/* <ScrollView style={styles.foodListContainer}> */}
        <Text style={styles.titleList}>My Shopping Cart:</Text>
        <TouchableOpacity
          style={styles.resetButton}
          onPress={showResetConfirmation}
        >
          <AntDesign name="close" size={24} color="white" />
        </TouchableOpacity>
        {loading ? (
          <ActivityIndicator size="large" color="#968ec0" />
        ) : foodList.length > 0 ? (
          foodList.map((item, index) => (
            <View key={index} style={styles.foodItemContainer}>
              <Text>{item.food}</Text>
              <Text>${item.price}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => showDeleteConfirmation(index)}
              >
                <FontAwesome6 name="trash-can" size={17} color="gray" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No Items Yet</Text>
        )}
      {/* </ScrollView> */}
      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => setShowCamera(true)}
      >
        <Feather name="camera" size={35} color="white" />
      </TouchableOpacity>
      <ConfirmationModal />
    </SafeAreaView>
  );
}
