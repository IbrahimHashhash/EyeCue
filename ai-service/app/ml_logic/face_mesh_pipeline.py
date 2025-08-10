import mediapipe as mp
class FaceMeshPipeline:
    def __init__(self):
        # Initialize MediaPipe Face Mesh in static image mode
        self.face_mesh = mp.solutions.face_mesh.FaceMesh(static_image_mode=True)
    def process(self, image_np):
        # Run face mesh on the input image (numpy RGB)
        return self.face_mesh.process(image_np)