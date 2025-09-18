import 'package:flutter/material.dart';
import 'timetable_screen.dart';
import 'attendance_screen.dart';
import 'profile_edit_screen.dart';
// VishnuLogo removed

class DashboardScreen extends StatefulWidget {
  final String userType;
  final String username;
  final String? regNo;
  final String? name;
  final String? year;
  final String? branch;
  final String? section;

  const DashboardScreen({
    super.key,
    required this.userType,
    required this.username,
    this.regNo,
    this.name,
    this.year,
    this.branch,
    this.section,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(Icons.school, color: Colors.white),
            const SizedBox(width: 10),
            Text('${widget.userType} Dashboard'),
          ],
        ),
        backgroundColor: widget.userType == 'Student'
            ? const Color.fromARGB(255, 79, 243, 33)
            : const Color.fromARGB(255, 244, 54, 158),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => ProfileEditScreen(
                    username: widget.username,
                    regNo: widget.regNo,
                    name: widget.name,
                    year: widget.year,
                    branch: widget.branch,
                    section: widget.section,
                  ),
                ),
              );
            },
            icon: const Icon(Icons.edit),
          ),
          IconButton(
            onPressed: () {
              Navigator.pushReplacementNamed(context, '/');
            },
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          children: [
            // Profile Section
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: widget.userType == 'Student'
                    ? Colors.blue.shade50
                    : Colors.red.shade50,
                borderRadius: BorderRadius.circular(15),
                border: Border.all(
                  color: widget.userType == 'Student'
                      ? const Color.fromARGB(255, 79, 243, 33)
                      : const Color.fromARGB(255, 244, 54, 158),
                  width: 2,
                ),
              ),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 40,
                    backgroundColor: widget.userType == 'Student'
                        ? const Color.fromARGB(255, 79, 243, 33)
                        : const Color.fromARGB(255, 244, 54, 158),
                    child: const Icon(
                      Icons.person,
                      size: 40,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(width: 20),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Welcome, ${widget.name ?? widget.username}',
                          style: const TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 5),
                        Text(
                          '${widget.userType}',
                          style: TextStyle(
                            fontSize: 16,
                            backgroundColor: widget.userType == 'Student'
                                ? const Color.fromARGB(255, 79, 243, 33)
                                : const Color.fromARGB(255, 244, 54, 158),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        const SizedBox(height: 5),
                        if (widget.userType == 'Student') ...[
                          Text('Reg No: ${widget.regNo ?? '-'}'),
                          Text('Year: ${widget.year ?? '-'}'),
                          Text('Branch: ${widget.branch ?? '-'}'),
                          Text('Section: ${widget.section ?? '-'}'),
                          const SizedBox(height: 5),
                        ],
                        Text(
                          '${DateTime.now().day}/${DateTime.now().month}/${DateTime.now().year}',
                          style: const TextStyle(fontSize: 14),
                        ),
                        Text(
                          '${DateTime.now().hour}:${DateTime.now().minute.toString().padLeft(2, '0')}',
                          style: const TextStyle(fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // Main Action Buttons
            Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => const TimetableScreen(),
                        ),
                      );
                    },
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: Colors.green,
                        borderRadius: BorderRadius.circular(15),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.green.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.schedule, size: 40, color: Colors.white),
                          SizedBox(height: 10),
                          Text(
                            'Time Table',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 20),
                Expanded(
                  child: GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AttendanceScreen(
                            userType: widget.userType,
                            username: widget.username,
                          ),
                        ),
                      );
                    },
                    child: Container(
                      height: 120,
                      decoration: BoxDecoration(
                        color: Colors.orange,
                        borderRadius: BorderRadius.circular(15),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.orange.withOpacity(0.3),
                            blurRadius: 10,
                            offset: const Offset(0, 5),
                          ),
                        ],
                      ),
                      child: const Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.check_circle,
                            size: 40,
                            color: Colors.white,
                          ),
                          SizedBox(height: 10),
                          Text(
                            'Mark Attendance',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
