function (input, startRule) {
      var parseFunctions = {
        "statements": parse_statements,
        "expression": parse_expression,
        "statement": parse_statement,
        "stat_expression": parse_stat_expression,
        "stat_define": parse_stat_define,
        "stat_assign": parse_stat_assign,
        "stat_var": parse_stat_var,
        "stat_if": parse_stat_if,
        "stat_repeat": parse_stat_repeat,
        "stat_with": parse_stat_with,
        "stat_turtle": parse_stat_turtle,
        "number_frac": parse_number_frac,
        "number": parse_number,
        "first_nbr_char": parse_first_nbr_char,
        "comp_op": parse_comp_op,
        "comparative": parse_comparative,
        "additive_op": parse_additive_op,
        "additive": parse_additive,
        "mult_op": parse_mult_op,
        "multiplicative": parse_multiplicative,
        "primary": parse_primary,
        "var_ref": parse_var_ref,
        "validfirstchar": parse_validfirstchar,
        "validchar": parse_validchar,
        "identifier": parse_identifier,
        "ws": parse_ws,
        "comma_expression": parse_comma_expression,
        "arglist": parse_arglist,
        "comma_identifier": parse_comma_identifier,
        "idlist": parse_idlist
      };
      
      if (startRule !== undefined) {
        if (parseFunctions[startRule] === undefined) {
          throw new Error("Invalid rule name: " + quote(startRule) + ".");
        }
      } else {
        startRule = "statements";
      }
      
      var pos = 0;
      var reportFailures = 0;
      var rightmostFailuresPos = 0;
      var rightmostFailuresExpected = [];
      
      function padLeft(input, padding, length) {
        var result = input;
        
        var padLength = length - input.length;
        for (var i = 0; i < padLength; i++) {
          result = padding + result;
        }
        
        return result;
      }
      
      function escape(ch) {
        var charCode = ch.charCodeAt(0);
        var escapeChar;
        var length;
        
        if (charCode <= 0xFF) {
          escapeChar = 'x';
          length = 2;
        } else {
          escapeChar = 'u';
          length = 4;
        }
        
        return '\\' + escapeChar + padLeft(charCode.toString(16).toUpperCase(), '0', length);
      }
      
      function matchFailed(failure) {
        if (pos < rightmostFailuresPos) {
          return;
        }
        
        if (pos > rightmostFailuresPos) {
          rightmostFailuresPos = pos;
          rightmostFailuresExpected = [];
        }
        
        rightmostFailuresExpected.push(failure);
      }
      
      function parse_statements() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_ws();
        if (result0 !== null) {
          result1 = [];
          result2 = parse_statement();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_statement();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, stuff) { return stuff; })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_expression() {
        var result0;
        var pos0;
        
        pos0 = pos;
        result0 = parse_comparative();
        if (result0 !== null) {
          result0 = (function(offset, expr) { return expr; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_statement() {
        var result0;
        
        result0 = parse_stat_var();
        if (result0 === null) {
          result0 = parse_stat_if();
          if (result0 === null) {
            result0 = parse_stat_define();
            if (result0 === null) {
              result0 = parse_stat_repeat();
              if (result0 === null) {
                result0 = parse_stat_with();
                if (result0 === null) {
                  result0 = parse_stat_turtle();
                  if (result0 === null) {
                    result0 = parse_stat_assign();
                    if (result0 === null) {
                      result0 = parse_stat_expression();
                    }
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_stat_expression() {
        var result0, result1, result2, result3;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_expression();
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 59) {
              result2 = ";";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\";\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result0 = [result0, result1, result2, result3];
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, expr) { return { tag:"ignore", body:expr }; })(pos0, result0[0]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stat_define() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13, result14, result15;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 7) === "define ") {
          result0 = "define ";
          pos += 7;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"define \"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_identifier();
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 40) {
                  result4 = "(";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"(\"");
                  }
                }
                if (result4 !== null) {
                  result5 = parse_ws();
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 41) {
                      result6 = ")";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\")\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = parse_ws();
                      if (result7 !== null) {
                        if (input.charCodeAt(pos) === 123) {
                          result8 = "{";
                          pos++;
                        } else {
                          result8 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"{\"");
                          }
                        }
                        if (result8 !== null) {
                          result9 = parse_ws();
                          if (result9 !== null) {
                            result10 = parse_statements();
                            if (result10 !== null) {
                              result11 = parse_ws();
                              if (result11 !== null) {
                                if (input.charCodeAt(pos) === 125) {
                                  result12 = "}";
                                  pos++;
                                } else {
                                  result12 = null;
                                  if (reportFailures === 0) {
                                    matchFailed("\"}\"");
                                  }
                                }
                                if (result12 !== null) {
                                  result13 = parse_ws();
                                  if (result13 !== null) {
                                    result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13];
                                  } else {
                                    result0 = null;
                                    pos = pos1;
                                  }
                                } else {
                                  result0 = null;
                                  pos = pos1;
                                }
                              } else {
                                result0 = null;
                                pos = pos1;
                              }
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, v, body) { return { tag:"define", name:v, args:[], body:body }; })(pos0, result0[2], result0[10]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          if (input.substr(pos, 7) === "define ") {
            result0 = "define ";
            pos += 7;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"define \"");
            }
          }
          if (result0 !== null) {
            result1 = parse_ws();
            if (result1 !== null) {
              result2 = parse_identifier();
              if (result2 !== null) {
                result3 = parse_ws();
                if (result3 !== null) {
                  if (input.charCodeAt(pos) === 40) {
                    result4 = "(";
                    pos++;
                  } else {
                    result4 = null;
                    if (reportFailures === 0) {
                      matchFailed("\"(\"");
                    }
                  }
                  if (result4 !== null) {
                    result5 = parse_ws();
                    if (result5 !== null) {
                      result6 = parse_idlist();
                      if (result6 !== null) {
                        result7 = parse_ws();
                        if (result7 !== null) {
                          if (input.charCodeAt(pos) === 41) {
                            result8 = ")";
                            pos++;
                          } else {
                            result8 = null;
                            if (reportFailures === 0) {
                              matchFailed("\")\"");
                            }
                          }
                          if (result8 !== null) {
                            result9 = parse_ws();
                            if (result9 !== null) {
                              if (input.charCodeAt(pos) === 123) {
                                result10 = "{";
                                pos++;
                              } else {
                                result10 = null;
                                if (reportFailures === 0) {
                                  matchFailed("\"{\"");
                                }
                              }
                              if (result10 !== null) {
                                result11 = parse_ws();
                                if (result11 !== null) {
                                  result12 = parse_statements();
                                  if (result12 !== null) {
                                    result13 = parse_ws();
                                    if (result13 !== null) {
                                      if (input.charCodeAt(pos) === 125) {
                                        result14 = "}";
                                        pos++;
                                      } else {
                                        result14 = null;
                                        if (reportFailures === 0) {
                                          matchFailed("\"}\"");
                                        }
                                      }
                                      if (result14 !== null) {
                                        result15 = parse_ws();
                                        if (result15 !== null) {
                                          result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13, result14, result15];
                                        } else {
                                          result0 = null;
                                          pos = pos1;
                                        }
                                      } else {
                                        result0 = null;
                                        pos = pos1;
                                      }
                                    } else {
                                      result0 = null;
                                      pos = pos1;
                                    }
                                  } else {
                                    result0 = null;
                                    pos = pos1;
                                  }
                                } else {
                                  result0 = null;
                                  pos = pos1;
                                }
                              } else {
                                result0 = null;
                                pos = pos1;
                              }
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, v, args, body) { return { tag:"define", name:v, args:args, body:body }; })(pos0, result0[2], result0[6], result0[12]);
          }
          if (result0 === null) {
            pos = pos0;
          }
        }
        return result0;
      }
      
      function parse_stat_assign() {
        var result0, result1, result2, result3, result4, result5, result6, result7;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            if (input.substr(pos, 2) === ":=") {
              result2 = ":=";
              pos += 2;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\":=\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result4 = parse_expression();
                if (result4 !== null) {
                  result5 = parse_ws();
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 59) {
                      result6 = ";";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\";\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = parse_ws();
                      if (result7 !== null) {
                        result0 = [result0, result1, result2, result3, result4, result5, result6, result7];
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, v, expr) { return { tag:":=", left:v, right:expr }; })(pos0, result0[0], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stat_var() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 4) === "var ") {
          result0 = "var ";
          pos += 4;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"var \"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_identifier();
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 59) {
                  result4 = ";";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\";\"");
                  }
                }
                if (result4 !== null) {
                  result5 = parse_ws();
                  if (result5 !== null) {
                    result0 = [result0, result1, result2, result3, result4, result5];
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, v) { return { tag: "var", name:v };})(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stat_if() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 2) === "if") {
          result0 = "if";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"if\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 40) {
              result2 = "(";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"(\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result4 = parse_expression();
                if (result4 !== null) {
                  result5 = parse_ws();
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 41) {
                      result6 = ")";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\")\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = parse_ws();
                      if (result7 !== null) {
                        if (input.charCodeAt(pos) === 123) {
                          result8 = "{";
                          pos++;
                        } else {
                          result8 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"{\"");
                          }
                        }
                        if (result8 !== null) {
                          result9 = parse_ws();
                          if (result9 !== null) {
                            result10 = parse_statements();
                            if (result10 !== null) {
                              result11 = parse_ws();
                              if (result11 !== null) {
                                if (input.charCodeAt(pos) === 125) {
                                  result12 = "}";
                                  pos++;
                                } else {
                                  result12 = null;
                                  if (reportFailures === 0) {
                                    matchFailed("\"}\"");
                                  }
                                }
                                if (result12 !== null) {
                                  result13 = parse_ws();
                                  if (result13 !== null) {
                                    result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13];
                                  } else {
                                    result0 = null;
                                    pos = pos1;
                                  }
                                } else {
                                  result0 = null;
                                  pos = pos1;
                                }
                              } else {
                                result0 = null;
                                pos = pos1;
                              }
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, expr, body) { return { tag:"if", "expr":expr, "body":body}; })(pos0, result0[4], result0[10]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stat_repeat() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 6) === "repeat") {
          result0 = "repeat";
          pos += 6;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"repeat\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 40) {
              result2 = "(";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"(\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result4 = parse_expression();
                if (result4 !== null) {
                  result5 = parse_ws();
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 41) {
                      result6 = ")";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\")\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = parse_ws();
                      if (result7 !== null) {
                        if (input.charCodeAt(pos) === 123) {
                          result8 = "{";
                          pos++;
                        } else {
                          result8 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"{\"");
                          }
                        }
                        if (result8 !== null) {
                          result9 = parse_ws();
                          if (result9 !== null) {
                            result10 = parse_statements();
                            if (result10 !== null) {
                              result11 = parse_ws();
                              if (result11 !== null) {
                                if (input.charCodeAt(pos) === 125) {
                                  result12 = "}";
                                  pos++;
                                } else {
                                  result12 = null;
                                  if (reportFailures === 0) {
                                    matchFailed("\"}\"");
                                  }
                                }
                                if (result12 !== null) {
                                  result13 = parse_ws();
                                  if (result13 !== null) {
                                    result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13];
                                  } else {
                                    result0 = null;
                                    pos = pos1;
                                  }
                                } else {
                                  result0 = null;
                                  pos = pos1;
                                }
                              } else {
                                result0 = null;
                                pos = pos1;
                              }
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, expr, body) { return { tag:"repeat", expr:expr, body:body}; })(pos0, result0[4], result0[10]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stat_with() {
        var result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 4) === "with") {
          result0 = "with";
          pos += 4;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"with\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            if (input.charCodeAt(pos) === 40) {
              result2 = "(";
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("\"(\"");
              }
            }
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result4 = parse_identifier();
                if (result4 !== null) {
                  result5 = parse_ws();
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 41) {
                      result6 = ")";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\")\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = parse_ws();
                      if (result7 !== null) {
                        if (input.charCodeAt(pos) === 123) {
                          result8 = "{";
                          pos++;
                        } else {
                          result8 = null;
                          if (reportFailures === 0) {
                            matchFailed("\"{\"");
                          }
                        }
                        if (result8 !== null) {
                          result9 = parse_ws();
                          if (result9 !== null) {
                            result10 = parse_statements();
                            if (result10 !== null) {
                              result11 = parse_ws();
                              if (result11 !== null) {
                                if (input.charCodeAt(pos) === 125) {
                                  result12 = "}";
                                  pos++;
                                } else {
                                  result12 = null;
                                  if (reportFailures === 0) {
                                    matchFailed("\"}\"");
                                  }
                                }
                                if (result12 !== null) {
                                  result13 = parse_ws();
                                  if (result13 !== null) {
                                    result0 = [result0, result1, result2, result3, result4, result5, result6, result7, result8, result9, result10, result11, result12, result13];
                                  } else {
                                    result0 = null;
                                    pos = pos1;
                                  }
                                } else {
                                  result0 = null;
                                  pos = pos1;
                                }
                              } else {
                                result0 = null;
                                pos = pos1;
                              }
                            } else {
                              result0 = null;
                              pos = pos1;
                            }
                          } else {
                            result0 = null;
                            pos = pos1;
                          }
                        } else {
                          result0 = null;
                          pos = pos1;
                        }
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, expr, body) { return { tag:"with", expr:expr, body:body}; })(pos0, result0[4], result0[10]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_stat_turtle() {
        var result0, result1, result2, result3, result4, result5, result6, result7;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.substr(pos, 7) === "turtle(") {
          result0 = "turtle(";
          pos += 7;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"turtle(\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_arglist();
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                if (input.charCodeAt(pos) === 41) {
                  result4 = ")";
                  pos++;
                } else {
                  result4 = null;
                  if (reportFailures === 0) {
                    matchFailed("\")\"");
                  }
                }
                if (result4 !== null) {
                  result5 = parse_ws();
                  if (result5 !== null) {
                    if (input.charCodeAt(pos) === 59) {
                      result6 = ";";
                      pos++;
                    } else {
                      result6 = null;
                      if (reportFailures === 0) {
                        matchFailed("\";\"");
                      }
                    }
                    if (result6 !== null) {
                      result7 = parse_ws();
                      if (result7 !== null) {
                        result0 = [result0, result1, result2, result3, result4, result5, result6, result7];
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, args) { return {tag: "turtle", args: args}; })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_number_frac() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 46) {
          result0 = ".";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\".\"");
          }
        }
        if (result0 !== null) {
          result1 = [];
          if (/^[0-9]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[0-9]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, chars) { return "." + chars.join(''); })(pos0, result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_number() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_first_nbr_char();
        if (result0 !== null) {
          result1 = [];
          if (/^[0-9]/.test(input.charAt(pos))) {
            result2 = input.charAt(pos);
            pos++;
          } else {
            result2 = null;
            if (reportFailures === 0) {
              matchFailed("[0-9]");
            }
          }
          while (result2 !== null) {
            result1.push(result2);
            if (/^[0-9]/.test(input.charAt(pos))) {
              result2 = input.charAt(pos);
              pos++;
            } else {
              result2 = null;
              if (reportFailures === 0) {
                matchFailed("[0-9]");
              }
            }
          }
          if (result1 !== null) {
            result2 = parse_number_frac();
            result2 = result2 !== null ? result2 : "";
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, head, chars, frac) { return parseFloat(head.concat(chars).join('') + frac); })(pos0, result0[0], result0[1], result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_first_nbr_char() {
        var result0;
        var pos0;
        
        pos0 = pos;
        if (/^[\-0-9]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[\\-0-9]");
          }
        }
        if (result0 !== null) {
          result0 = (function(offset, head) { return [ head ]; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_comp_op() {
        var result0;
        
        if (input.substr(pos, 2) === "<=") {
          result0 = "<=";
          pos += 2;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"<=\"");
          }
        }
        if (result0 === null) {
          if (input.substr(pos, 2) === ">=") {
            result0 = ">=";
            pos += 2;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\">=\"");
            }
          }
          if (result0 === null) {
            if (input.substr(pos, 2) === "!=") {
              result0 = "!=";
              pos += 2;
            } else {
              result0 = null;
              if (reportFailures === 0) {
                matchFailed("\"!=\"");
              }
            }
            if (result0 === null) {
              if (input.substr(pos, 2) === "==") {
                result0 = "==";
                pos += 2;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"==\"");
                }
              }
              if (result0 === null) {
                if (input.charCodeAt(pos) === 60) {
                  result0 = "<";
                  pos++;
                } else {
                  result0 = null;
                  if (reportFailures === 0) {
                    matchFailed("\"<\"");
                  }
                }
                if (result0 === null) {
                  if (input.charCodeAt(pos) === 62) {
                    result0 = ">";
                    pos++;
                  } else {
                    result0 = null;
                    if (reportFailures === 0) {
                      matchFailed("\">\"");
                    }
                  }
                }
              }
            }
          }
        }
        return result0;
      }
      
      function parse_comparative() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_additive();
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_comp_op();
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result4 = parse_comparative();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, left, op, right) { return {tag: op, left:left, right:right}; })(pos0, result0[0], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_additive();
        }
        return result0;
      }
      
      function parse_additive_op() {
        var result0;
        
        if (input.charCodeAt(pos) === 43) {
          result0 = "+";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"+\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 45) {
            result0 = "-";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"-\"");
            }
          }
        }
        return result0;
      }
      
      function parse_additive() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_multiplicative();
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_additive_op();
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result4 = parse_additive();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, left, op, right) { return {tag:op, left:left, right:right}; })(pos0, result0[0], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_multiplicative();
        }
        return result0;
      }
      
      function parse_mult_op() {
        var result0;
        
        if (input.charCodeAt(pos) === 42) {
          result0 = "*";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\"*\"");
          }
        }
        if (result0 === null) {
          if (input.charCodeAt(pos) === 47) {
            result0 = "/";
            pos++;
          } else {
            result0 = null;
            if (reportFailures === 0) {
              matchFailed("\"/\"");
            }
          }
        }
        return result0;
      }
      
      function parse_multiplicative() {
        var result0, result1, result2, result3, result4;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_primary();
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_mult_op();
            if (result2 !== null) {
              result3 = parse_ws();
              if (result3 !== null) {
                result4 = parse_multiplicative();
                if (result4 !== null) {
                  result0 = [result0, result1, result2, result3, result4];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, left, op, right) { return {tag:op, left:left, right:right}; })(pos0, result0[0], result0[2], result0[4]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        if (result0 === null) {
          result0 = parse_primary();
        }
        return result0;
      }
      
      function parse_primary() {
        var result0, result1, result2, result3, result4, result5;
        var pos0, pos1;
        
        result0 = parse_number();
        if (result0 === null) {
          pos0 = pos;
          pos1 = pos;
          result0 = parse_identifier();
          if (result0 !== null) {
            if (input.charCodeAt(pos) === 40) {
              result1 = "(";
              pos++;
            } else {
              result1 = null;
              if (reportFailures === 0) {
                matchFailed("\"(\"");
              }
            }
            if (result1 !== null) {
              result2 = parse_ws();
              if (result2 !== null) {
                if (input.charCodeAt(pos) === 41) {
                  result3 = ")";
                  pos++;
                } else {
                  result3 = null;
                  if (reportFailures === 0) {
                    matchFailed("\")\"");
                  }
                }
                if (result3 !== null) {
                  result0 = [result0, result1, result2, result3];
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
          if (result0 !== null) {
            result0 = (function(offset, v) { return {tag:"call", name:v, args:[]}; })(pos0, result0[0]);
          }
          if (result0 === null) {
            pos = pos0;
          }
          if (result0 === null) {
            pos0 = pos;
            pos1 = pos;
            result0 = parse_identifier();
            if (result0 !== null) {
              if (input.charCodeAt(pos) === 40) {
                result1 = "(";
                pos++;
              } else {
                result1 = null;
                if (reportFailures === 0) {
                  matchFailed("\"(\"");
                }
              }
              if (result1 !== null) {
                result2 = parse_ws();
                if (result2 !== null) {
                  result3 = parse_arglist();
                  if (result3 !== null) {
                    result4 = parse_ws();
                    if (result4 !== null) {
                      if (input.charCodeAt(pos) === 41) {
                        result5 = ")";
                        pos++;
                      } else {
                        result5 = null;
                        if (reportFailures === 0) {
                          matchFailed("\")\"");
                        }
                      }
                      if (result5 !== null) {
                        result0 = [result0, result1, result2, result3, result4, result5];
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
            } else {
              result0 = null;
              pos = pos1;
            }
            if (result0 !== null) {
              result0 = (function(offset, v, args) { return {tag:"call", name:v, args:args}; })(pos0, result0[0], result0[3]);
            }
            if (result0 === null) {
              pos = pos0;
            }
            if (result0 === null) {
              pos0 = pos;
              pos1 = pos;
              if (input.charCodeAt(pos) === 40) {
                result0 = "(";
                pos++;
              } else {
                result0 = null;
                if (reportFailures === 0) {
                  matchFailed("\"(\"");
                }
              }
              if (result0 !== null) {
                result1 = parse_ws();
                if (result1 !== null) {
                  result2 = parse_expression();
                  if (result2 !== null) {
                    result3 = parse_ws();
                    if (result3 !== null) {
                      if (input.charCodeAt(pos) === 41) {
                        result4 = ")";
                        pos++;
                      } else {
                        result4 = null;
                        if (reportFailures === 0) {
                          matchFailed("\")\"");
                        }
                      }
                      if (result4 !== null) {
                        result0 = [result0, result1, result2, result3, result4];
                      } else {
                        result0 = null;
                        pos = pos1;
                      }
                    } else {
                      result0 = null;
                      pos = pos1;
                    }
                  } else {
                    result0 = null;
                    pos = pos1;
                  }
                } else {
                  result0 = null;
                  pos = pos1;
                }
              } else {
                result0 = null;
                pos = pos1;
              }
              if (result0 !== null) {
                result0 = (function(offset, expr) { return expr; })(pos0, result0[2]);
              }
              if (result0 === null) {
                pos = pos0;
              }
              if (result0 === null) {
                result0 = parse_identifier();
              }
            }
          }
        }
        return result0;
      }
      
      function parse_var_ref() {
        var result0;
        var pos0;
        
        pos0 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result0 = (function(offset, id) { return { tag:"ident", name:id }; })(pos0, result0);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_validfirstchar() {
        var result0;
        
        if (/^[a-zA-Z_]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[a-zA-Z_]");
          }
        }
        return result0;
      }
      
      function parse_validchar() {
        var result0;
        
        if (/^[0-9a-zA-Z_]/.test(input.charAt(pos))) {
          result0 = input.charAt(pos);
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("[0-9a-zA-Z_]");
          }
        }
        return result0;
      }
      
      function parse_identifier() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_validfirstchar();
        if (result0 !== null) {
          result1 = [];
          result2 = parse_validchar();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_validchar();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, firstchar, chars) { return firstchar + chars.join(''); })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_ws() {
        var result0, result1;
        
        result0 = [];
        if (/^[ \t\n]/.test(input.charAt(pos))) {
          result1 = input.charAt(pos);
          pos++;
        } else {
          result1 = null;
          if (reportFailures === 0) {
            matchFailed("[ \\t\\n]");
          }
        }
        while (result1 !== null) {
          result0.push(result1);
          if (/^[ \t\n]/.test(input.charAt(pos))) {
            result1 = input.charAt(pos);
            pos++;
          } else {
            result1 = null;
            if (reportFailures === 0) {
              matchFailed("[ \\t\\n]");
            }
          }
        }
        return result0;
      }
      
      function parse_comma_expression() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 44) {
          result0 = ",";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\",\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_expression();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, expr) { return expr; })(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_arglist() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_expression();
        if (result0 !== null) {
          result1 = [];
          result2 = parse_comma_expression();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_comma_expression();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, first, rest) { return [first].concat(rest); })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_comma_identifier() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        if (input.charCodeAt(pos) === 44) {
          result0 = ",";
          pos++;
        } else {
          result0 = null;
          if (reportFailures === 0) {
            matchFailed("\",\"");
          }
        }
        if (result0 !== null) {
          result1 = parse_ws();
          if (result1 !== null) {
            result2 = parse_identifier();
            if (result2 !== null) {
              result0 = [result0, result1, result2];
            } else {
              result0 = null;
              pos = pos1;
            }
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, expr) {return expr;})(pos0, result0[2]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      function parse_idlist() {
        var result0, result1, result2;
        var pos0, pos1;
        
        pos0 = pos;
        pos1 = pos;
        result0 = parse_identifier();
        if (result0 !== null) {
          result1 = [];
          result2 = parse_comma_identifier();
          while (result2 !== null) {
            result1.push(result2);
            result2 = parse_comma_identifier();
          }
          if (result1 !== null) {
            result0 = [result0, result1];
          } else {
            result0 = null;
            pos = pos1;
          }
        } else {
          result0 = null;
          pos = pos1;
        }
        if (result0 !== null) {
          result0 = (function(offset, first, rest) { return [first].concat(rest); })(pos0, result0[0], result0[1]);
        }
        if (result0 === null) {
          pos = pos0;
        }
        return result0;
      }
      
      
      function cleanupExpected(expected) {
        expected.sort();
        
        var lastExpected = null;
        var cleanExpected = [];
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] !== lastExpected) {
            cleanExpected.push(expected[i]);
            lastExpected = expected[i];
          }
        }
        return cleanExpected;
      }
      
      function computeErrorPosition() {
        /*
         * The first idea was to use |String.split| to break the input up to the
         * error position along newlines and derive the line and column from
         * there. However IE's |split| implementation is so broken that it was
         * enough to prevent it.
         */
        
        var line = 1;
        var column = 1;
        var seenCR = false;
        
        for (var i = 0; i < Math.max(pos, rightmostFailuresPos); i++) {
          var ch = input.charAt(i);
          if (ch === "\n") {
            if (!seenCR) { line++; }
            column = 1;
            seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            line++;
            column = 1;
            seenCR = true;
          } else {
            column++;
            seenCR = false;
          }
        }
        
        return { line: line, column: column };
      }
      
      
      var result = parseFunctions[startRule]();
      
      /*
       * The parser is now in one of the following three states:
       *
       * 1. The parser successfully parsed the whole input.
       *
       *    - |result !== null|
       *    - |pos === input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 2. The parser successfully parsed only a part of the input.
       *
       *    - |result !== null|
       *    - |pos < input.length|
       *    - |rightmostFailuresExpected| may or may not contain something
       *
       * 3. The parser did not successfully parse any part of the input.
       *
       *   - |result === null|
       *   - |pos === 0|
       *   - |rightmostFailuresExpected| contains at least one failure
       *
       * All code following this comment (including called functions) must
       * handle these states.
       */
      if (result === null || pos !== input.length) {
        var offset = Math.max(pos, rightmostFailuresPos);
        var found = offset < input.length ? input.charAt(offset) : null;
        var errorPosition = computeErrorPosition();
        
        throw new this.SyntaxError(
          cleanupExpected(rightmostFailuresExpected),
          found,
          offset,
          errorPosition.line,
          errorPosition.column
        );
      }
      
      return result;
    }
