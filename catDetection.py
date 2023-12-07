# 아래 코드는 https://blog.naver.com/chandong83/221484138901 를 참고해서 작성했습니다.

import cv2
import os

# 고양이 detection을 위한 Parameter
# 정확도를 위해 카메라마다 테스트를 통해 최적의 값을 찾아야겠다.
mScaleFactor  = 1.1     # Parameter specifying how much the image size is reduced at each image scale.
mMinNeighbors = 1       # Parameter specifying how many neighbors each candidate rectangle should have to retain it.
mMinSize = (100,100)    # Minimum possible object size. Objects smaller than that are ignored.

# 고양이 얼굴 검출 함수 
def detectCatFace(imgPath):
    img = cv2.imread(imgPath, cv2.IMREAD_COLOR);                # 이미지 불러오기 
    grayImg = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)             # 회색으로 변경 
    # 고양이 얼굴 검출 
    cat_faces = face_cascade.detectMultiScale(grayImg, scaleFactor=mScaleFactor, minNeighbors=mMinNeighbors, minSize=mMinSize)
    print("The number of images found is : "+str(len(cat_faces)))   # 검출된 얼굴 개수 출력 
    
    # 검출된 고양이 얼굴 위치에 도형 그리기
    for (x,y,w,h) in cat_faces:
        cv2.rectangle(img,(x,y),(x+w,y+h),(0,255,0),2)

    #그려진 이미지 데이터를 리턴
    return img    

# 고양이 얼굴 인식용 haarcascade 파일 위치 적기
openCV_path = 'Your openCV library path'
cascade = openCV_path + '/opencv/data/haarcascades/haarcascade_frontalcatface.xml'

# 고양이 얼굴 인식 cascade 생성 
face_cascade = cv2.CascadeClassifier(cascade)

# 고양이 얼굴을 검출할 이미지
catPic = './output.jpg'

# 고양이 얼굴 검출 함수 호출 
img = detectCatFace(catPic)

# 결과 이미지를 저장할 경로
output_path = './draw_output.jpg'

# 결과 이미지 새롭게 저장하기
if len(img) != 0:
    cv2.imwrite(output_path, img)
