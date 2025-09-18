import 'package:flutter/material.dart';

class TimetableData {
  static const List<String> days = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];

  // Period labels 1..7 (Lunch is between 4 and 5)
  static const Map<int, String> periodTimes = {
    1: '08:00 - 08:50',
    2: '08:50 - 09:40',
    3: '10:00 - 10:50',
    4: '10:50 - 11:40',
    5: '13:00 - 13:50',
    6: '13:50 - 14:40',
    7: '14:40 - 15:30',
  };

  // Editable timetable values per day, 7 entries each
  // Populate based on your sheet; these are placeholders closely matching the image
  static const Map<String, List<String>> table = {
    'Monday': ['EDA', '-', 'FSD-2 LAB', 'FSD-2 LAB', 'RES', 'CN', 'CN'],
    'Tuesday': ['RES', 'OS', 'OS', 'IRS', 'Flutter LAB', '-', '-'],
    'Wednesday': ['IRS', 'CN', 'MINI PROJECT', '-', 'CODING', '-', '-'],
    'Thursday': ['EDA', '-', 'FSD-2', '-', 'IRS LAB / CN LAB', '-', '-'],
    'Friday': ['OS', 'IRS', 'CN', 'COUN', 'CN LAB / IRS LAB', '-', '-'],
    'Saturday': ['CN', 'IRS', 'OS', 'IRS', 'OS', 'RES', 'RA'],
  };

  static String todayName() {
    final int w = DateTime.now().weekday; // 1 Mon ... 7 Sun
    switch (w) {
      case DateTime.monday:
        return 'Monday';
      case DateTime.tuesday:
        return 'Tuesday';
      case DateTime.wednesday:
        return 'Wednesday';
      case DateTime.thursday:
        return 'Thursday';
      case DateTime.friday:
        return 'Friday';
      case DateTime.saturday:
        return 'Saturday';
      default:
        return 'Monday';
    }
  }

  static List<String> periodsForDay(String day) {
    return List<String>.from(table[day] ?? List<String>.filled(7, '-'));
  }

  static bool isNowWithinPeriod(int period, TimeOfDay now) {
    final String? range = periodTimes[period];
    if (range == null) return false;
    final parts = range.split(' - ');
    if (parts.length != 2) return false;
    TimeOfDay parse(String s) {
      final hhmm = s.split(':');
      int h = int.parse(hhmm[0]);
      int m = int.parse(hhmm[1]);
      return TimeOfDay(hour: h, minute: m);
    }

    final start = parse(parts[0]);
    final end = parse(parts[1]);
    final dt = DateTime(0, 1, 1, now.hour, now.minute);
    final sdt = DateTime(0, 1, 1, start.hour, start.minute);
    final edt = DateTime(0, 1, 1, end.hour, end.minute);
    return dt.isAfter(sdt) && dt.isBefore(edt);
  }
}
