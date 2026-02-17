#include <algorithm>
#include <cmath>
#include <fstream>
#include <functional>
#include <iomanip>
#include <iostream>
#include <random>
#include <sstream>
#include <string>
#include <vector>

struct Student {
    int id;
    std::string name;
    std::string major;
    double grade;
    int year;
    bool scholarship;
};

struct SearchResult {
    bool found = false;
    int comparisons = 0;
    int index = -1;
};

struct BSTNode {
    Student value;
    BSTNode* left = nullptr;
    BSTNode* right = nullptr;

    explicit BSTNode(const Student& s) : value(s) {}
};

std::vector<std::string> splitCsvLine(const std::string& line) {
    std::vector<std::string> fields;
    std::stringstream ss(line);
    std::string item;
    while (std::getline(ss, item, ',')) {
        fields.push_back(item);
    }
    return fields;
}

std::vector<Student> readStudents(const std::string& filename) {
    std::ifstream in(filename);
    if (!in) {
        throw std::runtime_error("Nu pot deschide fisierul: " + filename);
    }

    std::vector<Student> students;
    std::string line;
    std::getline(in, line);  // antet

    while (std::getline(in, line)) {
        if (line.empty()) {
            continue;
        }
        auto fields = splitCsvLine(line);
        if (fields.size() != 6) {
            continue;
        }

        Student s{};
        s.id = std::stoi(fields[0]);
        s.name = fields[1];
        s.major = fields[2];
        s.grade = std::stod(fields[3]);
        s.year = std::stoi(fields[4]);
        s.scholarship = (fields[5] == "da");
        students.push_back(s);
    }

    return students;
}

SearchResult sequentialSearch(const std::vector<Student>& data, int key) {
    SearchResult result;
    for (size_t i = 0; i < data.size(); ++i) {
        result.comparisons++;
        if (data[i].id == key) {
            result.found = true;
            result.index = static_cast<int>(i);
            return result;
        }
    }
    return result;
}

void bstInsert(BSTNode*& root, const Student& s) {
    if (root == nullptr) {
        root = new BSTNode(s);
        return;
    }
    if (s.id < root->value.id) {
        bstInsert(root->left, s);
    } else {
        bstInsert(root->right, s);
    }
}

SearchResult bstSearch(BSTNode* root, int key) {
    SearchResult result;
    BSTNode* current = root;
    while (current != nullptr) {
        result.comparisons++;
        if (key == current->value.id) {
            result.found = true;
            return result;
        }
        current = (key < current->value.id) ? current->left : current->right;
    }
    return result;
}

void freeBst(BSTNode* root) {
    if (!root) {
        return;
    }
    freeBst(root->left);
    freeBst(root->right);
    delete root;
}

SearchResult binarySearchById(const std::vector<Student>& sortedData, int key) {
    SearchResult result;
    int left = 0;
    int right = static_cast<int>(sortedData.size()) - 1;

    while (left <= right) {
        int mid = left + (right - left) / 2;
        result.comparisons++;

        if (sortedData[mid].id == key) {
            result.found = true;
            result.index = mid;
            return result;
        }
        if (sortedData[mid].id < key) {
            left = mid + 1;
        } else {
            right = mid - 1;
        }
    }

    return result;
}

SearchResult interpolationSearch(const std::vector<Student>& sortedData, int key) {
    SearchResult result;
    int low = 0;
    int high = static_cast<int>(sortedData.size()) - 1;

    while (low <= high && key >= sortedData[low].id && key <= sortedData[high].id) {
        if (sortedData[high].id == sortedData[low].id) {
            result.comparisons++;
            if (sortedData[low].id == key) {
                result.found = true;
                result.index = low;
            }
            return result;
        }

        const double ratio = static_cast<double>(key - sortedData[low].id) /
                             static_cast<double>(sortedData[high].id - sortedData[low].id);
        int pos = low + static_cast<int>((high - low) * ratio);

        if (pos < low || pos > high) {
            break;
        }

        result.comparisons++;
        if (sortedData[pos].id == key) {
            result.found = true;
            result.index = pos;
            return result;
        }

        if (sortedData[pos].id < key) {
            low = pos + 1;
        } else {
            high = pos - 1;
        }
    }

    return result;
}

double averageComparisonsForFoundKeys(
    const std::vector<int>& keys,
    const std::function<SearchResult(int)>& searchMethod) {
    long long total = 0;
    for (int key : keys) {
        total += searchMethod(key).comparisons;
    }
    return static_cast<double>(total) / static_cast<double>(keys.size());
}

int main() {
    try {
        auto data = readStudents("data/students.txt");
        if (data.empty()) {
            std::cerr << "Fisierul nu contine inregistrari valide.\n";
            return 1;
        }

        BSTNode* root = nullptr;
        for (const auto& s : data) {
            bstInsert(root, s);
        }

        auto sortedData = data;
        std::sort(sortedData.begin(), sortedData.end(), [](const Student& a, const Student& b) {
            return a.id < b.id;
        });

        std::vector<int> keys;
        keys.reserve(data.size());
        for (const auto& s : data) {
            keys.push_back(s.id);
        }

        std::mt19937 gen(2025);
        std::shuffle(keys.begin(), keys.end(), gen);

        const double n = static_cast<double>(data.size());
        const double seqTheory = (n + 1.0) / 2.0;
        const double bstTheory = std::log2(n) + 1.0;
        const double binTheory = std::log2(n);
        const double interpTheory = std::log2(std::log2(n));

        const double seqPractical = averageComparisonsForFoundKeys(
            keys, [&](int k) { return sequentialSearch(data, k); });
        const double bstPractical = averageComparisonsForFoundKeys(
            keys, [&](int k) { return bstSearch(root, k); });
        const double binPractical = averageComparisonsForFoundKeys(
            keys, [&](int k) { return binarySearchById(sortedData, k); });
        const double interpPractical = averageComparisonsForFoundKeys(
            keys, [&](int k) { return interpolationSearch(sortedData, k); });

        std::cout << "Numar inregistrari: " << data.size() << "\n\n";
        std::cout << std::fixed << std::setprecision(2);
        std::cout << "Metoda                               Teoretic   Practic\n";
        std::cout << "-------------------------------------------------------\n";
        std::cout << "Secventiala (tabel neordonat)        " << std::setw(8) << seqTheory
                  << "   " << std::setw(7) << seqPractical << "\n";
        std::cout << "Arbore binar cautare (neordonat)     " << std::setw(8) << bstTheory
                  << "   " << std::setw(7) << bstPractical << "\n";
        std::cout << "Binara (tabel ordonat)               " << std::setw(8) << binTheory
                  << "   " << std::setw(7) << binPractical << "\n";
        std::cout << "Interpolare (tabel ordonat)          " << std::setw(8) << interpTheory
                  << "   " << std::setw(7) << interpPractical << "\n\n";

        const int demoKey = data.front().id;
        auto demo = binarySearchById(sortedData, demoKey);
        std::cout << "Exemplu: cheia " << demoKey
                  << " a fost gasita cu " << demo.comparisons
                  << " comparatii prin cautare binara.\n";

        freeBst(root);
    } catch (const std::exception& ex) {
        std::cerr << "Eroare: " << ex.what() << "\n";
        return 1;
    }

    return 0;
}
