#include <iostream>
using namespace std;

int main() {
    string nama;
    if (cin >> nama) {
        cout << "Halo, " << nama << "! Dijalankan via GitHub Actions dari /compiler." << endl;
    } else {
        cout << "Halo dari /compiler di GitHub Actions!" << endl;
    }
    return 0;
}
