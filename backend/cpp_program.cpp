#include <iostream>
#include <string>
using namespace std;


int main(int argc, char* argv[]) {
  if (argc != 2) {
   cerr << "Usage: cpp_program <image_path>" << endl;
    return 1;
  }

 string imagePath = argv[1];

  // Your image processing logic here.
  // Example: Simply print the image path and a message.
 cout << "Image processed: " << imagePath << std::endl;
 cout << "C++ processing complete." << std::endl;

  return 0;
}