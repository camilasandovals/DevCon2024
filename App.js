import { useState, useRef } from "react";
import { Text, View, TouchableOpacity, SafeAreaView, Image, Button, Modal, ActivityIndicator, ScrollView } from "react-native";
import { Camera, CameraType } from "expo-camera";
import { Feather, FontAwesome6, AntDesign, MaterialIcons } from "@expo/vector-icons";
import { uploadPicture } from "./post.js";
import { styles } from './AppStyles.js'; 

export default function App() {

  const initialFoods = [
    // { food: "Oranges", price: "0.50" },
    // { food: "Bananas", price: "0.25" },
    // { food: "Milk", price: "3.00" },
  ];

  const calculateInitialTotal = () => {
    return initialFoods
      .reduce((total, item) => total + parseFloat(item.price), 0)
      .toFixed(2);
  };
  
  const [foodList, setFoodList] = useState(initialFoods);
  const [shoppingTotal, setShoppingTotal] = useState(calculateInitialTotal);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const cameraRef = useRef(null);
  const [pictureUri, setPictureUri] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    content: null,
    onConfirm: () => {},
  });

  const ConfirmationModal = () => (
    <Modal animationType="slide" transparent={true} visible={modalConfig.visible}
      onRequestClose={() =>
        setModalConfig((prev) => ({ ...prev, visible: false }))
      }
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {modalConfig.content}
          <View style={styles.buttonContainer}>
            <MaterialIcons name="cancel" size={60} color="#f77070"
              onPress={() =>
                setModalConfig((prev) => ({ ...prev, visible: false }))
              }
            />
            <AntDesign name="checkcircle" size={55} color="#8dc88d" 
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

  const showAddConfirmation = (result, uri) => {
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
      onConfirm: () => {
        const newItem = { ...result, imageUri: uri };
        const newFoodList = [...foodList, newItem];
        setFoodList(newFoodList);
        const additionalPrice = Number(result.price);
        const newTotal = parseFloat(shoppingTotal) + additionalPrice;
        setShoppingTotal(newTotal.toFixed(2));
      }
    });
  };

  const showDeleteConfirmation = (index) => {
    setModalConfig({
      visible: true,
      content: (
        <Text style={styles.modalText}>
          Are you sure you want to delete {foodList[index].food}?
        </Text>
      ),
      onConfirm: () => {
        const newFoodList = [...foodList];
        const itemToRemove = foodList[index];
        newFoodList.splice(index, 1);
        setFoodList(newFoodList);
        const updatedTotal = shoppingTotal - parseFloat(itemToRemove.price);
        setShoppingTotal(updatedTotal.toFixed(2));
      }
    });
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      setLoading(true);
      try {
        const photo = await cameraRef.current.takePictureAsync();
        setShowCamera(false);
        setPictureUri(photo.uri);
        const result = await uploadPicture(photo.uri);
        if (result.food === "unknown" || result.price === "unknown") {
          return;
        }
        setAnalysisResult(result);
        showAddConfirmation(result, photo.uri);
      } catch (error) {
        console.error("Error taking or uploading picture:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (showCamera) {
    if (!permission?.granted) {
      return (
        <View style={styles.container}>
          <Text>
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
          <TouchableOpacity style={styles.pictureButton} onPress={takePicture}></TouchableOpacity>
          <TouchableOpacity onPress={() => setCameraType((prev) => (prev === CameraType.back ? CameraType.front : CameraType.back))}>
            <FontAwesome6 name="arrows-rotate" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </Camera>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
        {loading ? (
          <ActivityIndicator size="large" color="#968ec0" />
        ) : foodList?.length > 0 ? (
          foodList?.map((item, index) => (
            <View key={index} style={styles.foodItemContainer}>
              <Text>{item?.food}</Text>
              <Text>${item?.price}</Text>
              <TouchableOpacity style={styles.deleteButton} onPress={() => showDeleteConfirmation(index)}>
                <FontAwesome6 name="trash-can" size={17} color="gray" />
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No Items Yet</Text>
        )}
    </SafeAreaView>
  );
}